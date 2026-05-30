"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import StaticBackground from "@/components/static-background";
import {
  OverlayCanvas,
  type FaceDetectionPayload,
  type FaceMeshPayload,
  type HandPosePayload,
} from "@/components/realtime-face/overlay-canvas";
import { useInferenceWorker } from "@/hooks/useInferenceWorker";

const SOURCE_WIDTH = 480;
const SOURCE_HEIGHT = 360;

type WorkerKey = "faceDetector" | "faceMesh" | "handPose";

const createFaceDetectorWorker = () =>
  new Worker(
    new URL("../../../../workers/tfjs/face-detection.worker.js", import.meta.url),
    { type: "module" },
  );

const createFaceMeshWorker = () =>
  new Worker(
    new URL("../../../../workers/tfjs/face-mesh.worker.js", import.meta.url),
    { type: "module" },
  );

const createHandPoseWorker = () =>
  new Worker(
    new URL("../../../../workers/tfjs/hand-pose.worker.js", import.meta.url),
    { type: "module" },
  );

export default function RealtimeFaceClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const cameraReadyRef = useRef(false);

  // Feed-on-result scheduling state (see feedRef assignment below).
  const feedRef = useRef<((key: WorkerKey) => void) | null>(null);
  const prefetchRef = useRef<Record<WorkerKey, Promise<ImageBitmap | null> | null>>({
    faceDetector: null,
    faceMesh: null,
    handPose: null,
  });
  const pendingRef = useRef<Record<WorkerKey, boolean>>({
    faceDetector: false,
    faceMesh: false,
    handPose: false,
  });

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);

  const [faceDetEnabled, setFaceDetEnabled] = useState(true);
  const [faceMeshEnabled, setFaceMeshEnabled] = useState(true);
  const [handPoseEnabled, setHandPoseEnabled] = useState(true);

  useEffect(() => {
    cameraReadyRef.current = cameraReady;
  }, [cameraReady]);

  const faceDetector = useInferenceWorker<FaceDetectionPayload>({
    workerFactory: createFaceDetectorWorker,
    enabled: faceDetEnabled,
    onResult: () => feedRef.current?.("faceDetector"),
  });

  const faceMesh = useInferenceWorker<FaceMeshPayload>({
    workerFactory: createFaceMeshWorker,
    enabled: faceMeshEnabled,
    onResult: () => feedRef.current?.("faceMesh"),
  });

  const handPose = useInferenceWorker<HandPosePayload>({
    workerFactory: createHandPoseWorker,
    enabled: handPoseEnabled,
    onResult: () => feedRef.current?.("handPose"),
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function setupWebcam() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve) => {
            const v = videoRef.current!;
            if (v.readyState >= 2) return resolve();
            v.onloadedmetadata = () => resolve();
          });
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        setCameraError(
          err instanceof Error ? err.message : "Failed to access webcam",
        );
      }
    }

    setupWebcam();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Feed-on-result scheduling. Each worker is re-fed the instant it returns a
  // result (via onResult above), and the next frame is decoded — prefetched —
  // while the worker is still busy. A worker is therefore never left idle
  // waiting for a requestAnimationFrame tick, which is what previously capped
  // each model at roughly half its achievable rate. Reassigned every render
  // so the closure always sees current worker state.
  feedRef.current = (key: WorkerKey) => {
    const video = videoRef.current;
    if (
      !video ||
      !cameraReadyRef.current ||
      video.readyState < 2 ||
      !visibleRef.current
    ) {
      return;
    }
    // pendingRef guards the decode window; isBusy() guards the inference
    // window — together they ensure exactly one frame in flight per worker.
    if (pendingRef.current[key]) return;

    const target =
      key === "faceDetector"
        ? { hook: faceDetector, enabled: faceDetEnabled }
        : key === "faceMesh"
          ? { hook: faceMesh, enabled: faceMeshEnabled }
          : { hook: handPose, enabled: handPoseEnabled };
    if (!target.enabled || !target.hook.isReady || target.hook.isBusy()) return;

    pendingRef.current[key] = true;
    const prefetched = prefetchRef.current[key];
    prefetchRef.current[key] = null;
    (prefetched ?? createImageBitmap(video).catch(() => null))
      .then((bitmap) => {
        if (!bitmap) return;
        const sent = target.hook.sendFrame(bitmap, performance.now());
        // Decode the next frame now, overlapped with this worker's inference.
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

  // requestAnimationFrame is only the safety net here: the feed-on-result
  // chain sustains itself once running, but rAF kick-starts each worker and
  // resumes feeding after the tab was hidden or the camera (re)connects.
  useEffect(() => {
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      feedRef.current?.("faceDetector");
      feedRef.current?.("faceMesh");
      feedRef.current?.("handPose");
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const anyError =
    cameraError ?? faceDetector.error ?? faceMesh.error ?? handPose.error;

  // Pipeline throughput = the bottleneck (slowest active model). Models run
  // in parallel, so a fully-fresh result tuple appears no faster than the
  // slowest one produces results.
  const pipelineFps = (() => {
    const active: number[] = [];
    if (faceDetEnabled && faceDetector.isReady) active.push(faceDetector.fps);
    if (faceMeshEnabled && faceMesh.isReady) active.push(faceMesh.fps);
    if (handPoseEnabled && handPose.isReady) active.push(handPose.fps);
    if (active.length === 0) return 0;
    return Math.min(...active);
  })();

  const allReady =
    (!faceDetEnabled || faceDetector.isReady) &&
    (!faceMeshEnabled || faceMesh.isReady) &&
    (!handPoseEnabled || handPose.isReady);

  return (
    <div className="min-h-screen flex flex-col">
      <StaticBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-8 pb-12 sm:pt-12 max-w-7xl">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              Realtime Vision Pipeline
            </h1>
            <h2 className="text-base sm:text-lg font-medium tracking-tight text-gray-300 max-w-2xl mx-auto">
              BlazeFace, FaceMesh (468 landmarks), and MediaPipe Hands running
              in parallel on TensorFlow.js with the WebGPU backend.
            </h2>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatusCard label="Status" value={anyError ? "Error" : allReady ? "Live" : "Loading…"} />
              <StatusCard label="Camera" value={cameraReady ? "On" : "Off"} />
              <StatusCard label="Pipeline FPS" value={pipelineFps.toFixed(1)} />
              <StatusCard label="Blinks" value={blinkCount.toString()} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <ModelToggle
                label="Face detector"
                enabled={faceDetEnabled}
                onToggle={() => setFaceDetEnabled((v) => !v)}
                ready={faceDetector.isReady}
                fps={faceDetector.fps}
                backend={faceDetector.backend}
                loadedBytes={faceDetector.loadedBytes}
                totalBytes={faceDetector.totalBytes}
                color="text-blue-400"
              />
              <ModelToggle
                label="Face mesh (468)"
                enabled={faceMeshEnabled}
                onToggle={() => setFaceMeshEnabled((v) => !v)}
                ready={faceMesh.isReady}
                fps={faceMesh.fps}
                backend={faceMesh.backend}
                loadedBytes={faceMesh.loadedBytes}
                totalBytes={faceMesh.totalBytes}
                color="text-purple-400"
              />
              <ModelToggle
                label="Hand pose"
                enabled={handPoseEnabled}
                onToggle={() => setHandPoseEnabled((v) => !v)}
                ready={handPose.isReady}
                fps={handPose.fps}
                backend={handPose.backend}
                loadedBytes={handPose.loadedBytes}
                totalBytes={handPose.totalBytes}
                color="text-yellow-400"
              />
            </div>

            <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-4 sm:p-6">
              {anyError ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-200 text-sm">{anyError}</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4 shadow-xl">
                  <div
                    ref={containerRef}
                    className="relative bg-black rounded-lg overflow-hidden aspect-video"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    <OverlayCanvas
                      width={SOURCE_WIDTH}
                      height={SOURCE_HEIGHT}
                      faceDetections={faceDetEnabled ? faceDetector.latestResult : null}
                      faceMesh={faceMeshEnabled ? faceMesh.latestResult : null}
                      handPose={handPoseEnabled ? handPose.latestResult : null}
                      onBlink={() => setBlinkCount((c) => c + 1)}
                    />
                    {!allReady && !anyError && (
                      <LoadingOverlay
                        workers={[
                          { enabled: faceDetEnabled, ready: faceDetector.isReady, loaded: faceDetector.loadedBytes, total: faceDetector.totalBytes },
                          { enabled: faceMeshEnabled, ready: faceMesh.isReady, loaded: faceMesh.loadedBytes, total: faceMesh.totalBytes },
                          { enabled: handPoseEnabled, ready: handPose.isReady, loaded: handPose.loadedBytes, total: handPose.totalBytes },
                        ]}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                <p>
                  Three TensorFlow.js detectors run in parallel Web Workers,
                  each with its own WebGPU device: BlazeFace for fast face
                  detection, MediaPipe FaceMesh for the 468-point facial mesh,
                  and MediaPipe Hands for two-hand 21-point pose estimation.
                </p>
                <p>
                  Each worker is re-fed the instant it returns a result, with
                  the next frame decoded while it is still busy — so a model is
                  never left idle waiting for a frame. Frames are zero-copy{" "}
                  <code className="text-blue-300">ImageBitmap</code> transfers,
                  and each model paces itself independently. The overlay
                  redraws on every <code>requestAnimationFrame</code> from the
                  latest results.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Tech Stack</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <span className="text-blue-300 font-medium">Runtime:</span>{" "}
                  TensorFlow.js + tfjs-backend-webgpu (WASM/CPU fallback)
                </li>
                <li>
                  <span className="text-purple-300 font-medium">Models:</span>{" "}
                  BlazeFace · FaceMesh · MediaPipe Hands
                </li>
                <li>
                  <span className="text-emerald-300 font-medium">Parallelism:</span>{" "}
                  one Web Worker per detector
                </li>
                <li>
                  <span className="text-orange-300 font-medium">Transport:</span>{" "}
                  transferable <code>ImageBitmap</code>, no CPU copy
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function ModelToggle({
  label,
  enabled,
  onToggle,
  ready,
  fps,
  backend,
  loadedBytes,
  totalBytes,
  color,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  ready: boolean;
  fps: number;
  backend: string | null;
  loadedBytes: number;
  totalBytes: number;
  color: string;
}) {
  const loading = enabled && !ready;
  const pct = totalBytes > 0 ? Math.min(100, (loadedBytes / totalBytes) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-lg p-3 border transition-colors text-left ${
        enabled
          ? "bg-gray-800 border-gray-600/70"
          : "bg-gray-900 border-gray-800/50 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${color}`}>{label}</div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {enabled ? (
              ready ? (
                <>
                  <span className="text-white tabular-nums font-medium">
                    {fps.toFixed(1)} fps
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
                      backend === "webgpu"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : backend === "wasm"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {backend ?? "?"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">
                  {totalBytes > 0
                    ? `${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`
                    : "loading…"}
                </span>
              )
            ) : (
              <span className="text-xs text-gray-500">off</span>
            )}
          </div>
        </div>
        <div
          className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
            enabled ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
              enabled ? "left-4" : "left-0.5"
            }`}
          />
        </div>
      </div>
      {loading && (
        <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </button>
  );
}

function LoadingOverlay({
  workers,
}: {
  workers: { enabled: boolean; ready: boolean; loaded: number; total: number }[];
}) {
  const active = workers.filter((w) => w.enabled);
  const totalLoaded = active.reduce((s, w) => s + w.loaded, 0);
  const totalSize = active.reduce((s, w) => s + w.total, 0);
  const readyCount = active.filter((w) => w.ready).length;
  const pct = totalSize > 0 ? Math.min(100, (totalLoaded / totalSize) * 100) : 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3 px-6">
      <div className="text-sm text-gray-200">
        Loading models · {readyCount} / {active.length}
      </div>
      <div className="h-2 w-64 max-w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      {totalSize > 0 && (
        <div className="text-xs text-gray-400 tabular-nums">
          {formatBytes(totalLoaded)} / {formatBytes(totalSize)}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
