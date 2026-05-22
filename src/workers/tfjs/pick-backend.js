// Pick the best TF.js backend available in this worker context.
// Order: WebGPU → CPU (TF.js wasm with XNNPACK SIMD).
//
// Why preflight requestAdapter: some Chrome configurations expose
// navigator.gpu but return null from requestAdapter() (GPU disabled, GPU
// blacklisted at chrome://gpu, or --disable-gpu). The tfjs-backend-webgpu
// init then throws a non-recoverable TypeError ("Cannot read properties of
// null (reading 'features')") that doesn't reliably surface as a rejected
// promise from setBackend, so we screen it out before calling setBackend.
export async function pickBackend(tf) {
  let webgpuOk = false;
  if (typeof navigator !== "undefined" && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: "high-performance",
      });
      webgpuOk = adapter != null;
    } catch {
      webgpuOk = false;
    }
  }

  const order = webgpuOk ? ["webgpu", "wasm"] : ["wasm"];
  for (const b of order) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      if (tf.getBackend() === b) return b;
    } catch {}
  }
  return tf.getBackend() || "unknown";
}
