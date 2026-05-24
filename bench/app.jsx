/**
 * Realtime-Face benchmark — React harness.
 *
 * Imports the REAL production hook (useInferenceWorker), the REAL overlay
 * (OverlayCanvas), and the REAL tech-logo field, and renders them in a
 * React tree — so it carries the same main-thread cost as the live page.
 *
 * v9 question: can the homepage's TechLogoField be used as a "fixed logos"
 * background on performance-critical pages without re-introducing the
 * regression `AnimatedBackground` had? Tested in `lite` mode (no backdrop-
 * filter / drop-shadow / layer blur) since those filters force the
 * compositor to re-blur every backdrop region per webcam frame.
 *   A = gradient only (current production StaticBackground)
 *   B = gradient + <TechLogoField animate={false} lite />
 * Both use feed-on-result + the real overlay. A/B interleaved (balanced
 * order) so GPU thermal drift hits both equally.
 *
 * Input: bench/test_vid.mp4 re-encoded to native 480x360, so
 * createImageBitmap(video) matches the webcam path exactly.
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { useInferenceWorker } from "../src/hooks/useInferenceWorker";
import { OverlayCanvas } from "../src/components/realtime-face/overlay-canvas";
import TechLogoField from "../src/components/tech-logo-field";

const GRADIENT_STYLE = {
  background:
    "radial-gradient(ellipse 90% 70% at 50% 38%, #1a1630 0%, #11101c 45%, #0a0a10 100%)",
};

const SRC_W = 480;
const SRC_H = 360;
const WARMUP_MS = 5000;
const WINDOW_MS = 4000;
const ORDER = ["A", "B", "B", "A", "A", "B", "B", "A"];
const CONFIGS = {
  A: { label: "gradient only (current production StaticBackground)", logos: false },
  B: { label: "gradient + lite static logos", logos: true },
};
const VARIANT = "v9 React harness — gradient only vs lite static TechLogoField";
const KEYS = ["faceDetector", "faceMesh", "handPose"];

const mkFactory = (file) => () =>
  new Worker(new URL(file, import.meta.url), { type: "module" });
const FACTORIES = {
  faceDetector: mkFactory("face-detection.worker.js"),
  faceMesh: mkFactory("face-mesh.worker.js"),
  handPose: mkFactory("hand-pose.worker.js"),
};

function median(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const r2 = (n) => Number(n.toFixed(2));

function Bench() {
  const videoRef = useRef(null);
  const videoReadyRef = useRef(false);
  const feedRef = useRef(null);
  const hooksRef = useRef(null);
  const prefetchRef = useRef({ faceDetector: null, faceMesh: null, handPose: null });
  const pendingRef = useRef({ faceDetector: false, faceMesh: false, handPose: false });
  const countRef = useRef({ faceDetector: 0, faceMesh: 0, handPose: 0 });

  const phaseRef = useRef("loading");
  const phaseStartRef = useRef(0);
  const windowIndexRef = useRef(0);
  const windowStartRef = useRef(0);
  const windowsRef = useRef([]);

  const [, forceRender] = useState(0);
  const [result, setResult] = useState(null);
  const [showLogos, setShowLogos] = useState(false);

  // feed-on-result: re-feed the worker the instant it returns a result.
  const onResult = (key) => {
    if (phaseRef.current === "measuring") countRef.current[key] += 1;
    feedRef.current?.(key);
  };

  const faceDetector = useInferenceWorker({
    workerFactory: FACTORIES.faceDetector,
    enabled: true,
    onResult: () => onResult("faceDetector"),
  });
  const faceMesh = useInferenceWorker({
    workerFactory: FACTORIES.faceMesh,
    enabled: true,
    onResult: () => onResult("faceMesh"),
  });
  const handPose = useInferenceWorker({
    workerFactory: FACTORIES.handPose,
    enabled: true,
    onResult: () => onResult("handPose"),
  });
  hooksRef.current = { faceDetector, faceMesh, handPose };

  feedRef.current = (key) => {
    const video = videoRef.current;
    const ph = phaseRef.current;
    if (ph === "loading" || ph === "done") return;
    if (!video || !videoReadyRef.current || video.readyState < 2) return;
    if (pendingRef.current[key]) return;
    const hook = hooksRef.current[key];
    if (!hook.isReady || hook.isBusy()) return;
    pendingRef.current[key] = true;
    const pre = prefetchRef.current[key];
    prefetchRef.current[key] = null;
    (pre ?? createImageBitmap(video).catch(() => null))
      .then((bmp) => {
        if (!bmp) return;
        const sent = hook.sendFrame(bmp, performance.now());
        if (sent && videoRef.current) {
          prefetchRef.current[key] = createImageBitmap(videoRef.current).catch(
            () => null,
          );
        }
      })
      .finally(() => {
        pendingRef.current[key] = false;
      });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = "./test_vid.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    const onCanPlay = () => {
      videoReadyRef.current = true;
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) onCanPlay();
    else video.addEventListener("canplay", onCanPlay, { once: true });
  }, []);

  useEffect(() => {
    let raf = 0;
    let stopped = false;

    const resetCounts = () => {
      for (const k of KEYS) countRef.current[k] = 0;
    };
    const recordWindow = () => {
      const secs = WINDOW_MS / 1000;
      const per = {};
      const fps = [];
      for (const k of KEYS) {
        const f = countRef.current[k] / secs;
        per[k] = r2(f);
        fps.push(f);
      }
      windowsRef.current.push({
        config: ORDER[windowIndexRef.current],
        pipelineFps: r2(Math.min(...fps)),
        perModel: per,
      });
    };
    const finalize = () => {
      const byCfg = {};
      for (const c of Object.keys(CONFIGS)) {
        const ws = windowsRef.current.filter((w) => w.config === c);
        const pipe = ws.map((w) => w.pipelineFps);
        const per = {};
        for (const k of KEYS) per[k] = r2(median(ws.map((w) => w.perModel[k])));
        byCfg[c] = {
          label: CONFIGS[c].label,
          medianPipelineFps: r2(median(pipe)),
          windows: pipe,
          perModel: per,
        };
      }
      const out = {
        variant: VARIANT,
        env: "React + real useInferenceWorker + OverlayCanvas + TechLogoField(lite)",
        backend: hooksRef.current.handPose.backend,
        input: `${SRC_W}x${SRC_H}`,
        windowMs: WINDOW_MS,
        order: ORDER,
        configs: byCfg,
        liteLogosCostPct: byCfg.A.medianPipelineFps
          ? r2(
              ((byCfg.A.medianPipelineFps - byCfg.B.medianPipelineFps) /
                byCfg.A.medianPipelineFps) *
                100,
            )
          : 0,
      };
      window.__BENCH_RESULT__ = out;
      setResult(out);
      console.log("BENCH_RESULT " + JSON.stringify(out));
      fetch("/result", { method: "POST", body: JSON.stringify(out) }).catch(
        () => {},
      );
    };

    const tick = () => {
      if (stopped) return;
      const now = performance.now();
      const hooks = hooksRef.current;
      const allReady = KEYS.every((k) => hooks[k].isReady);
      const ph = phaseRef.current;

      if (ph === "loading") {
        if (allReady && videoReadyRef.current) {
          phaseStartRef.current = now;
          phaseRef.current = "warmup";
        }
      } else if (ph === "warmup") {
        if (now - phaseStartRef.current >= WARMUP_MS) {
          windowIndexRef.current = 0;
          windowStartRef.current = now;
          setShowLogos(CONFIGS[ORDER[0]].logos);
          resetCounts();
          phaseRef.current = "measuring";
        }
      } else if (ph === "measuring") {
        if (now - windowStartRef.current >= WINDOW_MS) {
          recordWindow();
          windowIndexRef.current += 1;
          if (windowIndexRef.current >= ORDER.length) {
            phaseRef.current = "done";
            finalize();
          } else {
            windowStartRef.current = now;
            setShowLogos(CONFIGS[ORDER[windowIndexRef.current]].logos);
            resetCounts();
          }
        }
      }
      window.__BENCH_PHASE__ = phaseRef.current;

      if (phaseRef.current !== "loading" && phaseRef.current !== "done") {
        for (const k of KEYS) feedRef.current?.(k);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const display = setInterval(() => forceRender((n) => n + 1), 250);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearInterval(display);
    };
  }, []);

  const hooks = hooksRef.current;
  const ph = phaseRef.current;
  const liveFps = KEYS.map((k) => hooks[k].fps);
  const pipelineFps = Math.min(...liveFps);

  return (
    <div>
      {/* Both configs render the radial gradient (cheap, CSS only).
          Only B additionally mounts the lite static logo field. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={GRADIENT_STYLE}
      >
        {showLogos && <TechLogoField animate={false} lite />}
      </div>
      <h1>Realtime-Face Benchmark — React harness</h1>
      <div className="sub">{VARIANT}</div>
      <div className="row">
        <div className="stage">
          <video ref={videoRef} />
          <OverlayCanvas
            width={SRC_W}
            height={SRC_H}
            faceDetections={faceDetector.latestResult}
            faceMesh={faceMesh.latestResult}
            handPose={handPose.latestResult}
          />
        </div>
        <div className="panel">
          <div>
            Phase: <b>{ph.toUpperCase()}</b>{" "}
            {ph === "measuring" &&
              `· window ${windowIndexRef.current + 1}/${ORDER.length} · ` +
                `${ORDER[windowIndexRef.current]} (logos ${showLogos ? "ON" : "off"})`}
          </div>
          <div>
            Backend: <b>{faceDetector.backend ?? "…"}</b>
          </div>
          <div>
            Pipeline FPS (min):{" "}
            <b>{isFinite(pipelineFps) ? pipelineFps.toFixed(1) : "—"}</b>
          </div>
          <div>face detector: {faceDetector.fps.toFixed(1)} fps</div>
          <div>face mesh: {faceMesh.fps.toFixed(1)} fps</div>
          <div>hand pose: {handPose.fps.toFixed(1)} fps</div>
          {windowsRef.current.length > 0 && (
            <div className="small">
              windows →{" "}
              {windowsRef.current
                .map((w) => `${w.config}:${w.pipelineFps}`)
                .join("  ")}
            </div>
          )}
        </div>
      </div>
      {result && (
        <div>
          <div className="big">
            gradient {result.configs.A.medianPipelineFps} vs gradient+logos{" "}
            {result.configs.B.medianPipelineFps} fps — lite logos cost{" "}
            {result.liteLogosCostPct}%
          </div>
          <pre id="bench-result">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

let buildToken = null;
async function pollBuild() {
  try {
    const r = await fetch("/build-token", { cache: "no-store" });
    const { token } = await r.json();
    if (buildToken === null) buildToken = token;
    else if (token !== buildToken) location.reload();
  } catch {
    // server unreachable — ignore
  }
}
setInterval(pollBuild, 2000);
pollBuild();

createRoot(document.getElementById("root")).render(<Bench />);
