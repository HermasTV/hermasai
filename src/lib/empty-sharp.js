// Browser/worker-side stub for the Node-only `sharp` package.
// @huggingface/transformers statically `import`s sharp in utils/image.js, but
// never invokes it when running in the browser/worker. Next's webpack alias
// to `false` does not survive the worker compilation in this project, and
// IgnorePlugin makes webpack throw `Cannot find module 'sharp'` at runtime.
// Aliasing to this real, empty module makes the import resolve cleanly so
// the worker boots and installs its message handler.
export default {};
