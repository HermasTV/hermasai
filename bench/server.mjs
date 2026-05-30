/**
 * Standalone benchmark server.
 *
 *   node bench/server.mjs
 *
 * Serves bench/ as static files and adds two endpoints that make the
 * optimisation loop autonomous:
 *
 *   POST /result      — the harness posts its JSON result here; saved to
 *                       bench/last-result.json and appended to results.log.
 *   GET  /build-token — newest mtime of the worker bundles in dist/. The
 *                       harness polls this and reloads itself when it
 *                       changes, so rebuilding workers re-runs the benchmark
 *                       in an already-open browser tab with no manual reload.
 *
 * No range support — the test video is served whole (fine for loop playback).
 */
import http from "http";
import { readFile, writeFile, appendFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8970;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mp4": "video/mp4",
  ".wasm": "application/wasm",
};

// Changing any of these reloads the open benchmark tab.
const WATCHED_FILES = [
  "index.html",
  "dist/app.js",
  "dist/face-detection.worker.js",
  "dist/face-mesh.worker.js",
  "dist/hand-pose.worker.js",
];

async function buildToken() {
  let newest = 0;
  for (const f of WATCHED_FILES) {
    try {
      const s = await stat(path.join(dir, f));
      newest = Math.max(newest, s.mtimeMs);
    } catch {
      // a missing bundle just doesn't contribute to the token
    }
  }
  return Math.round(newest);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => resolve(body));
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const url = (req.url || "/").split("?")[0];

  if (req.method === "POST" && url === "/result") {
    const body = await readBody(req);
    try {
      await writeFile(path.join(dir, "last-result.json"), body);
      await appendFile(path.join(dir, "results.log"), body + "\n");
      let summary = body.slice(0, 240);
      try {
        const o = JSON.parse(body);
        summary = `${o.backend} | pipeline ${o.pipelineFps} fps | ${o.variant}`;
      } catch {}
      console.log("[bench] RESULT  " + summary);
    } catch (e) {
      res.writeHead(500).end(String(e));
      return;
    }
    res.writeHead(204).end();
    return;
  }

  if (req.method === "GET" && url === "/build-token") {
    res.writeHead(200, { "Content-Type": MIME[".json"] });
    res.end(JSON.stringify({ token: await buildToken() }));
    return;
  }

  // static files
  let rel = decodeURIComponent(url);
  if (rel === "/") rel = "/index.html";
  const filePath = path.join(dir, rel);
  if (!filePath.startsWith(dir)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("not found");
  }
});

server.listen(PORT, () => {
  console.log(`[bench] serving bench/ at http://localhost:${PORT}/`);
  console.log("[bench] waiting for results …");
});
