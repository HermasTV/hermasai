"use client";

import { useEffect } from "react";
import {
    useMoonshineLive,
    type MoonshineBackend,
    type MoonshineChunkMeta,
    type MoonshineStatus,
} from "@/hooks/useMoonshineLive";

const MOONSHINE_MODELS = [
    {
        id: "onnx-community/moonshine-tiny-ONNX",
        label: "Moonshine tiny",
        params: "27M",
        about: "Fastest. Good for short utterances on weaker GPUs.",
    },
    {
        id: "onnx-community/moonshine-base-ONNX",
        label: "Moonshine base",
        params: "61M",
        about: "More accurate. Recommended on modern desktop GPUs.",
    },
] as const;

interface Props {
    model: string;
    setModel: (model: string) => void;
    onTranscript: (text: string, meta: MoonshineChunkMeta) => void;
    onBackendChange?: (backend: MoonshineBackend) => void;
}

export function MoonshineSection({ model, setModel, onTranscript, onBackendChange }: Props) {
    const moonshine = useMoonshineLive({ model, onTranscript });

    useEffect(() => {
        onBackendChange?.(moonshine.backend);
    }, [moonshine.backend, onBackendChange]);

    const isActive =
        moonshine.status === "listening" ||
        moonshine.status === "speaking" ||
        moonshine.status === "transcribing";
    const isLoading = moonshine.status === "loading";

    const handleToggle = () => {
        if (isActive || isLoading) {
            void moonshine.stop();
        } else {
            void moonshine.start();
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Model
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOONSHINE_MODELS.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            disabled={isActive || isLoading}
                            onClick={() => setModel(m.id)}
                            className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                                model === m.id
                                    ? "bg-blue-500/10 border-blue-500/40"
                                    : "bg-gray-800 border-gray-700/50 hover:border-gray-600/70"
                            } ${isActive || isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <span
                                    className={`text-sm font-semibold ${
                                        model === m.id ? "text-blue-200" : "text-gray-100"
                                    }`}
                                >
                                    {m.label}
                                </span>
                                <span className="text-[11px] font-mono text-gray-400">
                                    {m.params} params
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-snug">
                                {m.about}
                            </p>
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                    English-only. Audio is segmented by Silero VAD and never leaves your device.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        isLoading
                            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                            : isActive
                              ? "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 focus:ring-red-400/40"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/30 active:scale-[0.98] focus:ring-blue-400/40"
                    }`}
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            Loading…
                        </>
                    ) : isActive ? (
                        <>
                            <StopIcon />
                            Stop listening
                        </>
                    ) : (
                        <>
                            <MicIcon />
                            Start listening
                        </>
                    )}
                </button>

                <LiveStatus status={moonshine.status} backend={moonshine.backend} />

                {isLoading && moonshine.progressItems.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        {moonshine.progressItems.map((p) => (
                            <div key={p.file}>
                                <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                                    <span className="truncate pr-2 font-mono">{p.file}</span>
                                    <span className="tabular-nums">{p.progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 rounded-full bg-gray-700 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                        style={{ width: `${p.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {moonshine.error && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {moonshine.error}
                    </div>
                )}
            </div>
        </div>
    );
}

function LiveStatus({ status, backend }: { status: MoonshineStatus; backend: MoonshineBackend }) {
    const map: Record<MoonshineStatus, { label: string; dot: string; pulse: boolean }> = {
        idle: { label: "Idle", dot: "bg-gray-500", pulse: false },
        loading: { label: "Loading model…", dot: "bg-amber-400", pulse: true },
        listening: { label: "Listening", dot: "bg-emerald-400", pulse: true },
        speaking: { label: "Speech detected", dot: "bg-blue-400", pulse: true },
        transcribing: { label: "Transcribing…", dot: "bg-purple-400", pulse: true },
        error: { label: "Error", dot: "bg-red-500", pulse: false },
    };
    const s = map[status];
    return (
        <div className="inline-flex items-center gap-2 self-start text-xs text-gray-300">
            <span className="relative flex w-2 h-2">
                {s.pulse && (
                    <span className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${s.dot}`} />
                )}
                <span className={`relative inline-flex w-2 h-2 rounded-full ${s.dot}`} />
            </span>
            <span>{s.label}</span>
            {backend && (
                <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${
                        backend === "webgpu"
                            ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                            : "text-amber-300 bg-amber-500/10 border-amber-500/30"
                    }`}
                    title={
                        backend === "webgpu"
                            ? "Running on WebGPU"
                            : "Running on WebAssembly (WebGPU not available)"
                    }
                >
                    {backend}
                </span>
            )}
        </div>
    );
}

function MicIcon() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
        </svg>
    );
}

function StopIcon() {
    return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
    );
}

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
