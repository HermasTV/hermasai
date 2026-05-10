// Wraps the worker's global fetch to report download progress for model weight
// files. The TF.js model packages don't expose a load-progress hook, so we
// intercept the network layer instead. Posts messages of shape
// { type: "progress", loaded, total } back to the main thread.

export function installProgressFetch() {
  const original = self.fetch.bind(self);
  let loadedBytes = 0;
  let totalBytes = 0;

  const isModelAsset = (url) =>
    /\.bin(\?|$)/.test(url) ||
    /model\.json(\?|$)/.test(url) ||
    /tfhub\.dev/.test(url) ||
    /storage\.googleapis\.com\/tfjs-models/.test(url) ||
    /tfjs-backend-wasm.*\.wasm/.test(url);

  self.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url ?? "";
    const response = await original(input, init);
    if (!isModelAsset(url) || !response.body) return response;

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 0) totalBytes += contentLength;

    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          loadedBytes += value.byteLength;
          self.postMessage({
            type: "progress",
            loaded: loadedBytes,
            total: totalBytes,
          });
          controller.enqueue(value);
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  };
}
