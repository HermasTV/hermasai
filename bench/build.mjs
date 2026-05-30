/**
 * Standalone benchmark builder.
 *
 * Bundles the React harness (app.jsx) plus the real production worker source
 * (src/workers/tfjs/*) with esbuild into bench/dist/. The harness imports the
 * real useInferenceWorker hook and OverlayCanvas component, so it carries the
 * same main-thread cost (React re-renders + overlay redraws) as the live page.
 *
 *   node bench/build.mjs            # one-off build
 *   node bench/build.mjs --watch    # rebuild on change
 */
import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const benchDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(benchDir, "..");
const workers = path.join(repoRoot, "src/workers/tfjs");

const entryPoints = [
  { in: path.join(benchDir, "app.jsx"), out: "app" },
  { in: path.join(workers, "face-detection.worker.js"), out: "face-detection.worker" },
  { in: path.join(workers, "face-mesh.worker.js"), out: "face-mesh.worker" },
  { in: path.join(workers, "hand-pose.worker.js"), out: "hand-pose.worker" },
];

const options = {
  entryPoints,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outdir: path.join(benchDir, "dist"),
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "info",
};

const watch = process.argv.includes("--watch");
if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("[bench] esbuild watching …");
} else {
  await esbuild.build(options);
  console.log("[bench] build complete → bench/dist/");
}
