// Pick the best TF.js backend available in this worker context.
//
// `preferred` controls the selection:
//   "auto" / "webgpu" / undefined — try WebGPU, fall back to wasm
//   "wasm"                        — force wasm (skip WebGPU entirely)
//
// Forcing wasm is useful for small models: BlazeFace / FaceMesh-class nets
// run faster on wasm (XNNPACK SIMD) than on WebGPU, where per-inference
// dispatch + readback overhead dominates, and keeping them off the GPU frees
// it for heavier models.
//
// Firefox override: Firefox shipped WebGPU on by default on Windows in late
// 2025 (Fx 141+), but the runtime is markedly slower than Chrome's Dawn —
// shaders compile via naga (WGSL → HLSL → DXIL on Windows), and 3 worker
// contexts compiling MediaPipe shader sets cold takes a couple of minutes,
// after which steady-state inference still tops out around 5 fps in our
// pipeline. wasm + XNNPACK SIMD gives a working experience instantly, so we
// flip "auto" → "wasm" on Firefox unless the caller asks for "webgpu"
// explicitly. Reassess once Firefox's WebGPU implementation matures.
function isFirefox() {
  if (typeof navigator === "undefined") return false;
  return /firefox/i.test(navigator.userAgent || "");
}
//
// Why preflight requestAdapter: some Chrome configurations expose
// navigator.gpu but return null from requestAdapter() (GPU disabled, GPU
// blacklisted at chrome://gpu, --disable-gpu, or — most commonly — a
// hybrid-GPU laptop where the high-performance discrete GPU isn't exposed
// to the browser). The tfjs-backend-webgpu init then throws a non-
// recoverable TypeError ("Cannot read properties of null (reading
// 'features')") that doesn't reliably surface as a rejected promise from
// setBackend, so we screen it out before calling setBackend.
//
// Adapter retry ladder: a single requestAdapter() commonly returns null
// not because WebGPU is unavailable but because Chrome's per-tab adapter
// pool is momentarily saturated. The main offender is React Strict Mode
// in Next dev: each worker hook mounts → spawns → cleanup → spawns
// again, so 3 workers briefly request 6 adapters in parallel before the
// cleanup-side releases its 3. We retry with exponential backoff so the
// second wave wins after the first wave's adapters are reclaimed. On
// Windows Chrome ignores `powerPreference` entirely (crbug/369219127),
// so we don't bother varying it there — pure retry is the only lever.
// If everything fails we fall back to wasm and log a warning so the
// reason for the fallback is visible in the console.
async function tryRequestAdapter() {
  // Backoff schedule: 0, 100, 250, 500, 1000 ms — total budget ~1.85s
  // worst case, but typically succeeds on the first or second attempt.
  const delays = [0, 100, 250, 500, 1000];
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: "high-performance",
      });
      if (adapter != null) return adapter;
      // Adapter request succeeded but returned null. Log once on the first
      // null so we can tell "null after retries" apart from a thrown error.
      if (i === 0) {
        console.warn(
          "[pick-backend] requestAdapter() returned null on first attempt; will retry.",
        );
      }
    } catch (err) {
      console.warn(
        `[pick-backend] requestAdapter() threw on attempt ${i + 1}:`,
        err,
      );
    }
  }
  return null;
}

export async function pickBackend(tf, preferred = "auto") {
  // Firefox: WebGPU works but the experience is bad (multi-minute cold compile
  // + ~5 fps). Treat it as wasm-only unless the caller forces "webgpu".
  if (preferred !== "webgpu" && preferred !== "wasm" && isFirefox()) {
    console.info(
      "[pick-backend] Firefox detected — using wasm backend. Firefox's WebGPU implementation is too slow for this pipeline (multi-minute shader compile, ~5 fps).",
    );
    preferred = "wasm";
  }

  let webgpuOk = false;
  if (
    preferred !== "wasm" &&
    typeof navigator !== "undefined" &&
    navigator.gpu
  ) {
    const adapter = await tryRequestAdapter();
    webgpuOk = adapter != null;
    if (!webgpuOk) {
      console.warn(
        "[pick-backend] navigator.gpu present but requestAdapter() returned null after retries — falling back to wasm. " +
          "Common causes: WebGPU disabled at chrome://gpu, hybrid GPU not exposed to Chrome, or too many WebGPU devices open across tabs.",
      );
    }
  }

  const order = webgpuOk ? ["webgpu", "wasm"] : ["wasm"];
  for (const b of order) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      if (tf.getBackend() === b) return b;
    } catch (err) {
      console.warn(`[pick-backend] setBackend("${b}") failed:`, err);
    }
  }
  return tf.getBackend() || "unknown";
}
