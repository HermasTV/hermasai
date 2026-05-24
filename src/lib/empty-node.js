// Browser/worker-side stub for `node:fs`, `node:path`, `node:url` that
// @huggingface/transformers' env.js statically imports. These imports are
// only used inside the server-only branch of the library (filesystem cache),
// but the static `import` still needs to resolve in the worker bundle.
// Webpack 5 cannot resolve the `node:` URI scheme on its own for non-server
// targets, so we redirect the requests to this empty default export.
export default {};
