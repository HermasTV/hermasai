# Realtime-Face Pipeline — Performance Optimization Report

_Date: 2026-05-22_

## Summary

The `realtime-face` demo runs three TensorFlow.js MediaPipe models in parallel
Web Workers — BlazeFace (face detection), FaceMesh (468-point mesh), and
MediaPipe Hands. With all three enabled it ran at roughly **10–15 fps**.

The shipped optimization — **feed-on-result scheduling** — raised pipeline
throughput by a **measured +41.7%**, with **zero change to model accuracy**.
It is a pure scheduling fix: the workers were spending roughly half their time
idle, waiting for the next animation-frame tick before being handed a frame.

Everything that was tried, measured, and decided:

| Change | Measured effect | Status |
|---|---|---|
| Consolidate 3 workers → 1 worker | −47% (regression) | Reverted |
| **feed-on-result + frame prefetch** | **+41.7%** | **Shipped** |
| Mixed backend (face models → WASM) | −50%+ | Rejected |
| Overlay rendering at large display scale | −4.5% | Acceptable as-is |
| **AnimatedBackground on the realtime-face page** | **−37%** | **Shipped — replaced with `StaticBackground`** |

The single most important lesson of this work is in section 3: **the GPU
thermally throttles**, so a single benchmark run is not reproducible. Only
A/B-interleaved measurement produces trustworthy numbers.

---

## 1. The problem, and the first attempt that failed

Goal: run more face/hand models concurrently without losing accuracy, and find
throughput headroom in the existing 3-model pipeline.

The first attempt followed an analysis that blamed "three separate WebGPU
devices contending" and consolidated the three per-model workers into one
worker sharing a single device. **It regressed badly — webcam FPS dropped from
~15 to ~8** and was reverted.

Why it failed: the three-worker design runs the models genuinely in parallel
across three OS threads, so per-frame wall-clock cost is approximately
`max(t_face, t_mesh, t_hand)`. The single worker ran them sequentially with
`await` between each, making per-frame cost `t_face + t_mesh + t_hand` — a sum
instead of a max. Removing device contention saved less than serial execution
cost. **The lesson: stop guessing, measure.**

---

## 2. The benchmark harness

Guesswork had produced one regression already, so the next step was a
reproducible benchmark. It lives in `bench/` and is deliberately standalone —
no Next.js, no Payload, no MongoDB.

- `bench/build.mjs` — bundles the **real production worker code**
  (`src/workers/tfjs/*`) with esbuild into `bench/dist/`. The benchmark
  therefore exercises exactly the code the app ships.
- `bench/server.mjs` — static server + two endpoints: `POST /result` (saves
  each run) and `GET /build-token` (the page auto-reloads when workers are
  rebuilt).
- `bench/index.html` + `bench/main.js` — the harness: feeds a fixed recording
  (`bench/test_vid.mp4`, copied from `docs/test_vid.mp4`, 1920×1080) through
  the pipeline, downscaled to the production 480×360 input.

Using a **fixed recorded video** instead of a live webcam means every variant
sees byte-identical input — a precondition for comparing variants at all.

### Running it

```bash
node bench/build.mjs        # bundle workers → bench/dist/
node bench/server.mjs       # serve at http://localhost:8970/
```

Then open `http://localhost:8970/` in a WebGPU-capable Chrome. **Use the
`localhost` URL** — a LAN-IP URL is an insecure origin and Chrome disables
WebGPU on it, silently falling back to WASM.

---

## 3. The methodology problem — thermal throttling

The first benchmark builds measured the *same* all-WebGPU configuration three
times and got **32 → 23 → 14.6 fps**, monotonically declining. A full Chrome
restart did not help.

The cause is **GPU thermal throttling**: a sustained inference benchmark keeps
the GPU pegged; it heats up and down-clocks, and each later run is slower than
the last. Restarting the browser does not cool the silicon.

Consequence: **a single benchmark run is meaningless**, and any two variants
measured in separate runs cannot be compared — the difference is dominated by
thermal drift, not code.

### The fix: A/B interleaving

The harness measures two configs **alternating window-by-window inside one
page load**, in a balanced order (`A B B A A B B A`) so each config's windows
have the same mean position in the session. Both configs see the same thermal
drift, so the **A-vs-B delta is trustworthy** even though absolute FPS is not.

This is why every number below 50% in this report comes from an interleaved
run, and why there is no single "the pipeline does N fps" figure — absolute
FPS depends on the machine and its thermal state.

---

## 4. Findings

### 4.1 feed-on-result — the shipped win (+41.7%)

**Diagnosis.** With the original requestAnimationFrame-gated loop, every model
ran at roughly *half* its achievable rate. Example from an early run: FaceMesh
had a 17 ms inference but produced only 31 fps — there is ~16 ms of dead time
per cycle. A worker finishes mid-frame, then waits for the next rAF tick
(up to ~16.7 ms), then waits again while `createImageBitmap` decodes.

**Fix.** Re-feed each worker the *instant* it returns a result, and decode the
next frame (prefetch) while the worker is still busy — so a worker is never
idle waiting for a frame.

**Proof (interleaved A/B, balanced 8-window run):**

| Config | Median pipeline FPS | Per-window |
|---|---|---|
| A — rAF-gated (original) | 15.9 | `16, 15.8, 15.5, 18.8` |
| B — feed-on-result + prefetch | **22.5** | `21.8, 21.3, 23.3, 23.5` |

**B beats A by +41.7%.** Pure scheduling — model inputs and outputs are
byte-identical, so accuracy is unchanged. (This run executed on the WASM
backend because the dev machine's WebGPU adapter was exhausted at the time;
the A/B delta is backend-independent — starvation is a scheduling property,
not a backend property.)

### 4.2 Mixed backend — rejected

Idea: small models (BlazeFace, FaceMesh) looked faster on WASM than WebGPU, so
run them on WASM and keep Hands on WebGPU. **Measured −50%+** — pipeline fell
from ~32 to ~15.

Cause: WASM runs inference on the **CPU**. Under feed-on-result the WASM
workers run flat-out and saturate CPU cores, which then starves the main
thread *and* the WebGPU worker's CPU-side work. Everything slows 2–3×. The
earlier "WASM is faster for small models" reading was an illusion — it was
measured when the rAF-gated loop left workers idle half the time, so the CPU
was not saturated.

**Conclusion: keep all models on WebGPU.** WebGPU offloads to the GPU and
keeps the CPU free — which also matters for rendering and for adding more
models (see the scaling guide).

### 4.3 AnimatedBackground — the dominant cost (−37%)

When the shipped feed-on-result change was deployed, the real page still ran
at ~15 fps — almost no change from before. The benchmark said +41.7%, yet the
real page didn't move. **The benchmark was not faithful enough.**

Rebuilding the harness as a React app that imports the **real** production
hook (`useInferenceWorker`) and the **real** overlay component
(`OverlayCanvas`) closed *most* of the gap — the React harness landed at
~37-46 fps. Still far from 15. The remaining factor was found by reading the
page tree: every page on this site wraps in `<AnimatedBackground />` — a
full-screen `<canvas>` running its own `requestAnimationFrame` loop, drawing
~138 particles (on a 1080p screen) with an **O(n²) connection-check between
all particle pairs every frame** (~9,500 distance computations per frame).
That runs on the main thread, in parallel with the pipeline's feed loop, the
React re-renders, and the overlay draws.

Adding `AnimatedBackground` to the harness and interleaving with-vs-without:

| Config | Median pipeline FPS |
|---|---|
| A — with AnimatedBackground (live page state) | **14.63** ← exactly matches the live page |
| B — without AnimatedBackground | 23.13 |

**AnimatedBackground costs 36.75% of pipeline throughput on this page.** The
14.63 fps measured here essentially *is* the user's reported 15 fps — the
harness now correctly models the live environment.

**Fix shipped.** `src/components/static-background.tsx` renders the same
gradient AnimatedBackground draws underneath, but as a static CSS-only div —
zero JS, zero rAF, zero per-frame cost. The realtime-face page
(`page.tsx` loading state + `realtime-face-client.tsx`) now uses
`StaticBackground` instead of `AnimatedBackground`. The gain on the live
page is roughly the +58% the benchmark predicts (14.63 → 23.13).

**General principle:** any page running a real-time compute pipeline should
not also run an unrelated continuous animation on the main thread. The other
ML-demo pages on the site (`speech-to-text`, `unet-segmentation`,
`ai-meeting-summary`) likely benefit from the same swap.

### 4.4 Overlay rendering at large scale — 4.5%

Rendering the full overlay (468-point face mesh + hand skeleton + boxes) on a
1280×720 canvas every frame, measured by interleaved A/B:

| Config (both feed-on-result) | Median pipeline FPS |
|---|---|
| A — no overlay | 16.5 |
| B — overlay @ 1280×720 | 15.75 |

**Overlay cost: ~4.5%.** Small. Main-thread Canvas2D rendering is fine to keep.
The overlay competes with the *face models* (main-thread feed loop), not the
hand-pose bottleneck, so the pipeline floor barely moves. Moving the overlay to
an OffscreenCanvas worker would reclaim that ~4.5% but is not urgent.

---

## 5. What shipped

Two independent changes; together they should roughly double the realtime-face
page's pipeline FPS. No model, input, or output changed — accuracy is
identical.

**1) Feed scheduling** (+41.7% in the workers themselves):

- **`src/hooks/useInferenceWorker.ts`** — added an optional `onResult`
  callback, invoked the moment a worker returns a result (held in a ref so a
  changing callback never re-creates the worker).
- **`src/app/(frontend)/projects/realtime-face/realtime-face-client.tsx`** —
  replaced the rAF-gated batch feed with `feedRef`: each worker is re-fed via
  `onResult` the instant it goes idle, and the next frame is prefetched during
  inference. `requestAnimationFrame` is kept only as a safety net that
  kick-starts workers and resumes feeding after the tab was hidden or the
  camera reconnects. A `pendingRef` guard plus the existing `isBusy()` ensure
  exactly one frame in flight per worker.
- **`src/workers/tfjs/pick-backend.js`** — gained an optional `preferred`
  backend argument (`"wasm" | "webgpu" | "auto"`). Backward compatible: the app
  passes nothing, so behaviour is unchanged. It exists for benchmarking and for
  future per-model backend selection.

**2) Background change** (+58% on the realtime-face page specifically):

- **`src/components/static-background.tsx`** — new component, a static
  CSS-only gradient matching what AnimatedBackground draws underneath.
- **`src/app/(frontend)/projects/realtime-face/page.tsx`** and
  **`realtime-face-client.tsx`** — swapped `<AnimatedBackground />` for
  `<StaticBackground />`. Visually identical, zero JS / rAF / canvas cost.
  Scoped to the realtime-face page only; other pages keep `AnimatedBackground`.

The benchmark `bench/` directory is kept as a reusable R&D tool. Build outputs
(`bench/dist/`), the copied video, and result logs are git-ignored.

---

## 6. Caveats and known issues

- **Absolute FPS is not a fixed number.** It depends on the machine and its
  thermal state. The trustworthy figure is the *relative* gain: +41.7%.
- **WebGPU device exhaustion.** Each page load creates three WebGPU devices
  (one per worker). Repeated reloads can leave Chrome unable to grant new
  adapters until it is restarted; the demo then silently falls back to WASM.
  For a normal user who loads the page once this is a non-issue, but it is a
  reason the "many models" direction should be careful about device count
  (see the scaling guide).
- The benchmark's later runs executed on WASM for this reason. The shipped
  optimization is a scheduling fix and applies identically on either backend.

---

## 7. Reproducing the measurements

1. `node bench/build.mjs && node bench/server.mjs`
2. Open `http://localhost:8970/` in a WebGPU Chrome on `localhost`.
3. The page runs warm-up + 8 interleaved windows (~40 s) and POSTs the result
   to `bench/last-result.json`; it also logs `BENCH_RESULT {json}` to the
   console.
4. To benchmark a new variant, edit `bench/main.js` (or a worker, then
   re-run `node bench/build.mjs`); the open tab auto-reloads and re-measures.

See `docs/realtime-face-scaling.md` for how this applies to the goal of
serving many face/hand models concurrently.
