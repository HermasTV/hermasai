// Moonshine ASR worker.
//
// Loads a Moonshine model from the Hugging Face Hub on first use and runs
// transcription on Float32 audio segments (16 kHz mono). The hook on the
// main thread feeds it speech segments cut out by Silero VAD; this worker
// is single-shot per segment and posts a complete transcript per call.
//
// Messages from main:
//   { type: "preload", model }            — pre-fetch + warm the pipeline
//   { type: "transcribe", model, audio }  — transcribe a Float32 segment
//
// Messages to main:
//   { status: "progress", file, progress, ... }   — passthrough from HF loader
//   { status: "ready" }                            — pipeline warmed and ready
//   { status: "complete", text, durationMs, audioDurationS }
//   { status: "error", message }

import { pipeline } from "@huggingface/transformers";

// ORT pipes its W: graph-optimization warnings (Removing initializer ...,
// VerifyEachNodeIsAssignedToAnEp) through console.error from the native
// WASM side. `ort.env.logLevel` only controls the JS-side logger, so the
// only robust way to silence them is to filter console.error directly.
// We filter only the known benign patterns; real errors still log.
const _origConsoleError = self.console.error.bind(self.console);
const _ortNoise = ["CleanUnusedInitializersAndNodeArgs", "VerifyEachNodeIsAssignedToAnEp"];
self.console.error = (...args) => {
    const first = args[0];
    if (typeof first === "string" && _ortNoise.some((p) => first.includes(p))) return;
    _origConsoleError(...args);
};

class MoonshinePipelineFactory {
    static task = "automatic-speech-recognition";
    static model = null;
    static instancePromise = null;

    static async getInstance(model, progress_callback = null) {
        if (this.instancePromise && this.model === model) {
            return this.instancePromise;
        }
        // Different model requested — dispose the previous one.
        if (this.instancePromise) {
            try {
                const prev = await this.instancePromise;
                prev?.dispose?.();
            } catch {
                // ignore disposal failures
            }
            this.instancePromise = null;
        }
        this.model = model;
        // Probe for a real WebGPU adapter first so we can report the chosen
        // backend back to the main thread *and* pass an explicit device to
        // pipeline(). `device: 'auto'` works but doesn't expose the choice,
        // and a manual webgpu→wasm catch-and-retry doesn't recover because
        // ORT caches its first backend-init failure on the same instance.
        let backend = "wasm";
        try {
            if (typeof navigator !== "undefined" && navigator.gpu) {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) backend = "webgpu";
            }
        } catch {
            // requestAdapter can throw on some platforms; default stays wasm.
        }
        self.postMessage({ status: "backend", backend });

        this.instancePromise = pipeline(this.task, model, {
            device: backend,
            dtype: "fp32",
            progress_callback,
        });
        return this.instancePromise;
    }
}

self.addEventListener("message", async (event) => {
    const msg = event.data;

    try {
        if (msg.type === "preload") {
            await MoonshinePipelineFactory.getInstance(msg.model, (data) => {
                self.postMessage({ status: "progress", ...data });
            });
            self.postMessage({ status: "ready" });
            return;
        }

        if (msg.type === "transcribe") {
            const transcriber = await MoonshinePipelineFactory.getInstance(
                msg.model,
                (data) => self.postMessage({ status: "progress", ...data }),
            );
            const start = performance.now();
            const result = await transcriber(msg.audio);
            const durationMs = performance.now() - start;
            self.postMessage({
                status: "complete",
                text: (result?.text ?? "").trim(),
                durationMs,
                audioDurationS: msg.audio.length / 16000,
            });
            return;
        }
    } catch (err) {
        self.postMessage({
            status: "error",
            message: err?.message ?? String(err),
        });
    }
});
