# Realtime-Face — Scaling to Many Face/Hand Models

_Date: 2026-05-22 — companion to `realtime-face-optimization.md`_

This guide captures how to grow the realtime-face pipeline toward its intended
direction — **serving the largest number of face- and hand-related models
concurrently** (detection, mesh, hand landmarks, recognition/embeddings,
emotion, head pose, age, gesture, …) — without collapsing performance.

It is based on what the benchmark campaign actually proved, not on theory.

---

## Principles proven by the benchmark

### 1. Keep every model on WebGPU

WebGPU runs inference on the GPU and leaves the CPU free. WASM runs it on the
CPU. The mixed-backend experiment showed that even **two** WASM models running
continuously saturate CPU cores and slow the *whole* pipeline 2–3× — including
the WebGPU models and the overlay rendering, which all need CPU time.

WASM does not scale: it costs roughly one CPU core per model. WebGPU does. As
the model count grows this gap widens. **All models on WebGPU.**

### 2. feed-on-result, never rAF-gated

The shipped change (see the optimization report) re-feeds each worker the
instant it returns a result, with the next frame prefetched during inference.
This keeps every worker at its true `1/latency` rate. Any new model must be fed
the same way — a model left waiting for an animation-frame tick runs at half
speed.

### 3. Bound the worker and GPU-device count

Each WebGPU worker holds its own `GPUDevice`. Three is fine. Ten is not — the
browser can exhaust available adapters, and many devices contend. But the
opposite extreme (one worker running everything sequentially) also failed: it
turned per-frame cost into a *sum* of latencies.

The rule: **workers run in parallel, models inside a worker run in series.**
So group models by how fresh they must be (next section), and keep the total
worker count small (≈2–4), not one-per-model as the count grows.

### 4. Cadence is the lever that makes "many models" cheap

Not every model needs to run every frame. Detection and landmarks must (they
track motion). Identity, emotion, age, head pose change slowly — running them
every 5th–10th frame is imperceptible and cuts their cost 5–10×.

This is the single most important technique for scaling: a recognition model
at cadence 10 adds ~10% of one model's cost, not 100%.

### 5. Shared detection + ROI cropping

Today FaceMesh and Hands each re-run their *own internal detector* every frame
on the full frame. With many face models this is paid over and over.

Instead: run face detection **once**, then have every downstream face model
(mesh, recognition, emotion, head pose) consume the detected bounding box and
operate on a **cropped ROI** (~192×192 around the face) rather than the full
480×360 frame. Every added face model then becomes cheap. This is the biggest
structural change available and the right next investment after the current
shipped win.

---

## Recommended architecture for many models

```
                 ┌─────────────────────────────────────────┐
  webcam frame → │ main thread: capture + feed-on-result +   │
                 │ overlay (OffscreenCanvas once it grows)   │
                 └───────────────┬───────────────────────────┘
            ┌──────────────┬─────┴───────┬────────────────────┐
            ▼              ▼             ▼                    ▼
   ┌────────────────┐ ┌──────────┐ ┌──────────┐  ┌───────────────────────┐
   │ DETECTION       │ │ FACE     │ │ HAND     │  │ LOW-CADENCE worker     │
   │ worker          │ │ landmark │ │ landmark │  │ (recognition, emotion, │
   │ face + palm     │ │ worker   │ │ worker   │  │  head pose, age) — runs│
   │ every frame     │ │ every fr │ │ every fr │  │  every Nth frame, on   │
   │ → boxes         │ │ on ROI   │ │ on ROI   │  │  the face ROI          │
   └────────────────┘ └──────────┘ └──────────┘  └───────────────────────┘
```

- **Detection worker** — face + hand/palm detection every frame; emits boxes.
- **Landmark workers** — face mesh and hand landmarks every frame, each fed the
  **ROI crop** from the detection boxes, not the whole frame.
- **Low-cadence worker** — recognition/embeddings, emotion, head pose, age:
  several models in one worker, run every Nth frame on the face ROI. Because
  they are infrequent, summing their latencies inside one worker is fine.

Worker count stays small (≈4) regardless of model count, so GPU-device use
stays bounded.

---

## Checklist for adding a model

1. **Backend**: WebGPU. (`pick-backend.js` already accepts a preference.)
2. **Cadence**: every frame only if it tracks motion; otherwise every 5–10.
3. **Placement**: needs every-frame freshness → its own worker; low cadence →
   share the low-cadence worker.
4. **Input**: a face model gets the **ROI crop**, not the full frame.
5. **Validate**: benchmark it with an interleaved A/B (model-on vs model-off)
   in `bench/` — confirm the real cost before committing. Never trust a single
   run; the GPU thermally throttles (see the optimization report).

---

## Visualization as it grows

Overlay rendering currently costs ~4.5% (measured). It is main-thread Canvas2D.
As the number of drawn models and the display size grow, move the overlay to
an **OffscreenCanvas owned by a worker** — that takes drawing off the main
thread entirely and protects the capture/feed loop. Do it when the measured
overlay cost crosses ~10%, not before.

---

## The benchmark is the tool

`bench/` is kept specifically so every future change is measured, not guessed.
The campaign began with a guessed optimization that regressed 47%. Every claim
in these documents that is under 50% comes from an interleaved A/B run.

Add a model, give it a config flag in `bench/main.js`, run the A/B, keep it
only if the measured delta justifies it.
