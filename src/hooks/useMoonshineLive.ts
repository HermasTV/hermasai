/**
 * useMoonshineLive — orchestrates Silero VAD + Moonshine ASR for live
 * microphone transcription. The VAD (Silero v5 via @ricky0123/vad-web) detects
 * speech segments and hands their audio to a Moonshine worker for transcription.
 * The hook surfaces a small state machine so the UI can show loading, listening,
 * speaking, and transcribing states without having to know about either system.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import type { MicVAD as MicVADType } from "@ricky0123/vad-web";

export type MoonshineStatus =
    | "idle"
    | "loading"
    | "listening"
    | "speaking"
    | "transcribing"
    | "error";

export interface MoonshineChunkMeta {
    durationMs: number;
    audioDurationS: number;
}

export interface UseMoonshineLiveOptions {
    model: string;
    onTranscript: (text: string, meta: MoonshineChunkMeta) => void;
}

interface ProgressItem {
    file: string;
    progress: number;
}

// Serve VAD assets (silero_vad_v5.onnx + worklet) and the onnxruntime-web
// WASM files locally from /public/vad/. CDN URLs for ricky0123/vad-web's
// dependent onnxruntime-web build were 404'ing because the version it
// pins (1.22.0-dev) is unpublished on jsdelivr. Local paths also remove a
// runtime dependency on a third-party CDN. Files are copied from
// node_modules in this repo (see the install step / commit history).
const VAD_BASE = "/vad/";
const ORT_BASE = "/vad/ort/";

// Silero VAD's ONNX graph contains a couple hundred unused initializers
// that the WASM-compiled native ORT optimizer cheerfully strips while
// loading, logging one [W:onnxruntime: ... CleanUnusedInitializersAndNodeArgs]
// line per stripped node — through console.error, which paints them red.
// `ort.env.logLevel` only controls the JS-side logger; the native one is
// controlled per-session via `logSeverityLevel`, which vad-web doesn't
// expose. Easiest robust fix: install a one-time console.error filter
// that drops lines matching the known noise patterns. Anything else
// (real exceptions, our own error postMessage) still gets through.
let consoleFilterInstalled = false;
function installOrtNoiseFilter() {
    if (consoleFilterInstalled || typeof console === "undefined") return;
    consoleFilterInstalled = true;
    const original = console.error.bind(console);
    const noisePatterns = [
        "CleanUnusedInitializersAndNodeArgs",
        "VerifyEachNodeIsAssignedToAnEp",
    ];
    console.error = (...args: unknown[]) => {
        const first = args[0];
        if (typeof first === "string" && noisePatterns.some((p) => first.includes(p))) {
            return;
        }
        original(...args);
    };
}

export type MoonshineBackend = "webgpu" | "wasm" | null;

export function useMoonshineLive({
    model,
    onTranscript,
}: UseMoonshineLiveOptions) {
    const [status, setStatus] = useState<MoonshineStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [modelReady, setModelReady] = useState(false);
    const [backend, setBackend] = useState<MoonshineBackend>(null);

    const workerRef = useRef<Worker | null>(null);
    const vadRef = useRef<MicVADType | null>(null);
    // The closure passed into MicVAD's onSpeechEnd captures stale state
    // unless we route through a ref. Same pattern for the onTranscript cb.
    const modelRef = useRef(model);
    const onTranscriptRef = useRef(onTranscript);

    useEffect(() => {
        modelRef.current = model;
        // Switching model invalidates any pre-warmed pipeline state.
        setModelReady(false);
    }, [model]);

    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    const ensureWorker = useCallback((): Worker => {
        if (workerRef.current) return workerRef.current;
        const worker = new Worker(
            new URL("../workers/moonshine.worker.js", import.meta.url),
            { type: "module" },
        );
        worker.addEventListener("message", (e) => {
            const data = e.data;
            switch (data.status) {
                case "progress":
                    if (data.file && typeof data.progress === "number") {
                        setProgressItems((prev) => {
                            const next = [...prev];
                            const idx = next.findIndex(
                                (p) => p.file === data.file,
                            );
                            const entry = { file: data.file, progress: data.progress };
                            if (idx >= 0) next[idx] = entry;
                            else next.push(entry);
                            return next;
                        });
                    }
                    break;
                case "ready":
                    setModelReady(true);
                    setProgressItems([]);
                    setStatus((s) => (s === "loading" ? "listening" : s));
                    break;
                case "backend":
                    if (data.backend === "webgpu" || data.backend === "wasm") {
                        setBackend(data.backend);
                    }
                    break;
                case "complete":
                    setStatus((s) => (s === "transcribing" ? "listening" : s));
                    onTranscriptRef.current(data.text, {
                        durationMs: data.durationMs,
                        audioDurationS: data.audioDurationS,
                    });
                    break;
                case "error":
                    setError(data.message ?? "Unknown error");
                    setStatus("error");
                    break;
            }
        });
        workerRef.current = worker;
        return worker;
    }, []);

    const stop = useCallback(async () => {
        const v = vadRef.current;
        vadRef.current = null;
        if (v) {
            try {
                await v.pause();
                await v.destroy();
            } catch {
                // ignore teardown errors
            }
        }
        setStatus((s) => (s === "error" ? s : "idle"));
    }, []);

    const start = useCallback(async () => {
        setError(null);
        setStatus("loading");
        setProgressItems([]);
        installOrtNoiseFilter();
        try {
            // Tell the worker to pre-fetch the ASR model in parallel with
            // VAD initialization so the first phrase has the lowest possible
            // latency.
            const worker = ensureWorker();
            worker.postMessage({ type: "preload", model: modelRef.current });

            // Dynamic import keeps vad-web (and its onnxruntime-web import)
            // out of the main bundle; only loaded when the user actually
            // starts live mode.
            const { MicVAD } = await import("@ricky0123/vad-web");

            const vad = await MicVAD.new({
                model: "v5",
                baseAssetPath: VAD_BASE,
                onnxWASMBasePath: ORT_BASE,
                // Tighten VAD timing for snappier perceived latency.
                // Library defaults: redemptionMs 1400, preSpeechPadMs 800,
                // minSpeechMs 400. The 1.4s post-speech wait is the main
                // source of perceived delay in the live transcript. 500ms
                // still feels natural and shaves ~900ms off every phrase.
                redemptionMs: 500,
                preSpeechPadMs: 200,
                minSpeechMs: 250,
                // Silero VAD's ONNX graph contains unused constants that
                // ORT logs at W: level while loading. Those log lines are
                // routed through console.error by ort, which paints them
                // red in DevTools even though nothing is wrong. Bump the
                // global log level to "error" so only real failures show.
                ortConfig: (ort) => {
                    ort.env.logLevel = "error";
                },
                onSpeechStart: () => setStatus("speaking"),
                onVADMisfire: () =>
                    setStatus((s) => (s === "speaking" ? "listening" : s)),
                onSpeechEnd: (audio: Float32Array) => {
                    setStatus("transcribing");
                    worker.postMessage({
                        type: "transcribe",
                        model: modelRef.current,
                        audio,
                    });
                },
            });
            vadRef.current = vad;
            await vad.start();
            setStatus("listening");
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            setStatus("error");
        }
    }, [ensureWorker]);

    // Tear down on unmount: release mic + worker.
    useEffect(() => {
        return () => {
            void stop();
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, [stop]);

    return {
        status,
        error,
        progressItems,
        modelReady,
        backend,
        start,
        stop,
    };
}
