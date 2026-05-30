"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import LogosBackground from "@/components/logos-background";
import { AudioManager } from "@/components/AudioManager";
import { MoonshineSection } from "@/components/MoonshineSection";
import { useTranscriber } from "@/hooks/useTranscriber";
import type { MoonshineBackend, MoonshineChunkMeta } from "@/hooks/useMoonshineLive";
import { formatAudioTimestamp } from "@/utils/AudioUtils";

// Force dynamic rendering for this page (WebGPU requires browser environment)
export const dynamic = "force-dynamic";

type EngineTab = "whisper" | "moonshine";

type WhisperChunk = {
    source: "whisper";
    text: string;
    timestamp: [number, number | null];
};

type MoonshineChunk = {
    source: "moonshine";
    text: string;
    arrivedAt: number;
    durationMs: number;
    audioDurationS: number;
};

type UnifiedChunk = WhisperChunk | MoonshineChunk;

const DEFAULT_MOONSHINE_MODEL = "onnx-community/moonshine-tiny-ONNX";

export default function SpeechToTextPage() {
    const transcriber = useTranscriber();
    const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const [tab, setTab] = useState<EngineTab>("whisper");
    const [chunks, setChunks] = useState<UnifiedChunk[]>([]);
    const [moonshineModel, setMoonshineModel] = useState(DEFAULT_MOONSHINE_MODEL);
    const [moonshineBackend, setMoonshineBackend] = useState<MoonshineBackend>(null);

    useEffect(() => {
        setIsClient(true);
        if (typeof navigator !== "undefined" && navigator.gpu) {
            setIsWebGPUAvailable(true);
        }
    }, []);

    // Whisper writes its full chunk list every time output changes; we replace
    // any prior whisper chunks but keep moonshine history above it.
    useEffect(() => {
        const out = transcriber.output;
        if (!out?.chunks?.length) return;
        setChunks((prev) => [
            ...prev.filter((c) => c.source !== "whisper"),
            ...out.chunks.map((c) => ({
                source: "whisper" as const,
                text: c.text,
                timestamp: c.timestamp,
            })),
        ]);
    }, [transcriber.output]);

    const appendMoonshine = (text: string, meta: MoonshineChunkMeta) => {
        if (!text) return;
        setChunks((prev) => [
            ...prev,
            {
                source: "moonshine",
                text,
                arrivedAt: Date.now(),
                durationMs: meta.durationMs,
                audioDurationS: meta.audioDurationS,
            },
        ]);
    };

    const status = useMemo(() => {
        if (tab === "whisper") {
            if (transcriber.isModelLoading) return { label: "Loading model", tone: "amber" as const };
            if (transcriber.isBusy) return { label: "Transcribing", tone: "blue" as const };
            if (transcriber.output) return { label: "Ready", tone: "emerald" as const };
            return { label: "Idle", tone: "gray" as const };
        }
        // Moonshine state lives inside MoonshineSection; the engine-status row
        // for Moonshine is shown inside that section. Keep this neutral.
        return { label: "Live mode", tone: "gray" as const };
    }, [tab, transcriber.isModelLoading, transcriber.isBusy, transcriber.output]);

    const tpsValue =
        tab === "whisper" && transcriber.output?.tps
            ? `${transcriber.output.tps.toFixed(1)} tok/s`
            : "—";

    const modelLabel =
        tab === "whisper" ? shortenModel(transcriber.model) : shortenModel(moonshineModel);

    const transcriptCount = chunks.length;

    if (!isClient) return null;

    if (!isWebGPUAvailable) {
        return (
            <div className="min-h-screen flex flex-col">
                <LogosBackground />
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4 py-16">
                    <div className="max-w-md w-full bg-gray-800 border border-gray-700/50 rounded-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
                            <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">WebGPU not available</h1>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            This lab runs ASR models entirely in your browser via WebGPU. Try the latest
                            <span className="text-white"> Chrome</span> or <span className="text-white">Edge</span> on
                            desktop to use it.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <LogosBackground />
            <Navbar />
            <main className="flex-grow">
                <div className="container mx-auto px-4 pt-8 pb-16 sm:pt-12 max-w-7xl">
                    {/* Hero */}
                    <header className="text-center mb-8 sm:mb-10">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-300 tracking-widest uppercase">
                            <span className="relative flex w-1.5 h-1.5">
                                <span className="absolute inline-flex w-full h-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-400" />
                            </span>
                            On-device · Browser only
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
                            Audio Models Lab
                        </h1>
                        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Two automatic speech recognition models running fully client-side in your
                            browser via Transformers.js and WebGPU. Pick a model, send it audio, and
                            watch the transcript stream in.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            <TechBadge>WebGPU</TechBadge>
                            <TechBadge>Transformers.js</TechBadge>
                            <TechBadge>Whisper</TechBadge>
                            <TechBadge>Moonshine</TechBadge>
                            <TechBadge>Silero VAD</TechBadge>
                        </div>
                    </header>

                    {/* Status row */}
                    <div className="max-w-4xl mx-auto mb-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatusCard label="Active model" value={modelLabel} mono />
                            <StatusCard
                                label="Status"
                                value={status.label}
                                tone={status.tone}
                                pulse={status.tone === "blue" || status.tone === "amber"}
                            />
                            <StatusCard
                                label="Backend"
                                value={backendDisplay(tab, moonshineBackend)}
                                tone={backendTone(tab, moonshineBackend)}
                            />
                            <StatusCard label="Throughput" value={tpsValue} mono />
                        </div>
                    </div>

                    {/* Tabbed engine card */}
                    <section className="max-w-4xl mx-auto mb-10">
                        <div className="bg-gray-800 border border-gray-700/50 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
                            {/* Tab bar */}
                            <div role="tablist" aria-label="ASR engine" className="flex border-b border-gray-700/50">
                                <Tab
                                    active={tab === "whisper"}
                                    onClick={() => setTab("whisper")}
                                    title="Whisper"
                                    subtitle="URL · file · recording"
                                />
                                <Tab
                                    active={tab === "moonshine"}
                                    onClick={() => setTab("moonshine")}
                                    title="Moonshine"
                                    subtitle="Live microphone (VAD)"
                                />
                            </div>

                            <div className="p-5 sm:p-6">
                                {tab === "whisper" ? (
                                    <div>
                                        <SectionHeader
                                            accent="bg-blue-400"
                                            title="Audio source"
                                            hint="Paste a URL, upload a file, or record live."
                                        />
                                        <AudioManager transcriber={transcriber} />
                                    </div>
                                ) : (
                                    <div>
                                        <SectionHeader
                                            accent="bg-purple-400"
                                            title="Live transcription"
                                            hint="Start the mic; speak naturally — pauses split phrases."
                                        />
                                        <MoonshineSection
                                            model={moonshineModel}
                                            setModel={setMoonshineModel}
                                            onTranscript={appendMoonshine}
                                            onBackendChange={setMoonshineBackend}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Shared transcript */}
                            <div className="border-t border-gray-700/50 p-5 sm:p-6">
                                <SectionHeader
                                    accent="bg-emerald-400"
                                    title="Transcript"
                                    hint={
                                        transcriptCount > 0
                                            ? `${transcriptCount} segment${transcriptCount === 1 ? "" : "s"}`
                                            : undefined
                                    }
                                    actionLabel={transcriptCount > 0 ? "Clear" : undefined}
                                    onAction={() => setChunks([])}
                                />
                                <div className="rounded-xl bg-gray-900 border border-gray-700/40 min-h-[240px]">
                                    {transcriptCount === 0 ? (
                                        <EmptyTranscript tab={tab} />
                                    ) : (
                                        <UnifiedTranscript chunks={chunks} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About + tech stack */}
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoCard accent="bg-blue-400" title="About this lab">
                            <p>
                                Two ASR pipelines side-by-side. <span className="text-blue-300">Whisper</span> is the
                                familiar OpenAI model — strong multilingual accuracy on full audio files. {" "}
                                <span className="text-purple-300">Moonshine</span> (Useful Sensors, 2024) is much
                                smaller and tuned for low-latency live transcription on short utterances.
                            </p>
                            <p>
                                Both run entirely client-side through <span className="text-white">Transformers.js</span>{" "}
                                on the WebGPU ONNX Runtime backend. Moonshine&apos;s live mode uses{" "}
                                <span className="text-emerald-300">Silero VAD v5</span> to slice audio at natural
                                speech boundaries so each call to the model is a complete phrase.
                            </p>
                        </InfoCard>

                        <InfoCard
                            accent="bg-purple-400"
                            title="Tech Stack"
                        >
                            <StackRow label="Runtime" value="Transformers.js 3.x · ONNX Runtime Web" tone="text-blue-300" />
                            <StackRow label="Acceleration" value="WebGPU (WASM fallback)" tone="text-emerald-300" />
                            <StackRow label="ASR" value="Whisper · Moonshine (tiny / base)" tone="text-purple-300" />
                            <StackRow label="VAD" value="Silero VAD v5 (live mode)" tone="text-amber-300" />
                            <StackRow label="Audio" value="Web Audio API · 16 kHz mono" tone="text-pink-300" />
                            <StackRow label="Concurrency" value="Dedicated Web Workers" tone="text-cyan-300" />
                        </InfoCard>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Local presentational components
// ---------------------------------------------------------------------------

function TechBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700/60 text-xs font-medium text-gray-300">
            {children}
        </span>
    );
}

type Tone = "gray" | "blue" | "emerald" | "amber";

const toneClasses: Record<Tone, string> = {
    gray: "text-gray-300",
    blue: "text-blue-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
};

const dotClasses: Record<Tone, string> = {
    gray: "bg-gray-400",
    blue: "bg-blue-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
};

function StatusCard({
    label,
    value,
    tone = "gray",
    mono = false,
    pulse = false,
}: {
    label: string;
    value: string;
    tone?: Tone;
    mono?: boolean;
    pulse?: boolean;
}) {
    return (
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                {label}
            </div>
            <div
                className={`mt-1 flex items-center gap-2 text-sm font-semibold ${toneClasses[tone]} ${
                    mono ? "tabular-nums" : ""
                }`}
            >
                {tone !== "gray" && (
                    <span className="relative flex w-1.5 h-1.5">
                        {pulse && (
                            <span
                                className={`absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping ${dotClasses[tone]}`}
                            />
                        )}
                        <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${dotClasses[tone]}`} />
                    </span>
                )}
                <span className="truncate">{value}</span>
            </div>
        </div>
    );
}

function Tab({
    active,
    onClick,
    title,
    subtitle,
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    subtitle: string;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`flex-1 px-5 py-4 text-left transition-colors border-b-2 ${
                active
                    ? "border-blue-400/80 bg-blue-500/5"
                    : "border-transparent hover:bg-gray-700"
            }`}
        >
            <div className={`text-sm font-semibold tracking-tight ${active ? "text-white" : "text-gray-300"}`}>
                {title}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{subtitle}</div>
        </button>
    );
}

function SectionHeader({
    accent,
    title,
    hint,
    actionLabel,
    onAction,
}: {
    accent: string;
    title: string;
    hint?: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="flex items-end justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <span className={`w-1 h-5 rounded-full ${accent}`} />
                <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            </div>
            <div className="flex items-center gap-3">
                {hint && <span className="text-xs text-gray-400 truncate">{hint}</span>}
                {actionLabel && onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="text-xs font-medium text-gray-400 hover:text-white border border-gray-700/60 hover:border-gray-600/70 rounded-md px-2 py-1 transition-colors"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyTranscript({ tab }: { tab: EngineTab }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-12 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v3m-3.5 0h7M12 14a3 3 0 01-3-3V6a3 3 0 016 0v5a3 3 0 01-3 3z" />
                </svg>
            </div>
            <p className="text-sm text-gray-300 font-medium">No transcript yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
                {tab === "whisper"
                    ? "Pick an audio source above, then press Transcribe."
                    : "Click Start listening and speak. Pauses split your speech into phrases."}
            </p>
        </div>
    );
}

function UnifiedTranscript({ chunks }: { chunks: UnifiedChunk[] }) {
    return (
        <div className="p-3 sm:p-4 space-y-2 max-h-[24rem] overflow-y-auto">
            {chunks.map((c, i) => (
                <TranscriptRow key={`${c.source}-${i}-${c.text.slice(0, 20)}`} chunk={c} />
            ))}
        </div>
    );
}

function TranscriptRow({ chunk }: { chunk: UnifiedChunk }) {
    const isWhisper = chunk.source === "whisper";
    const meta = isWhisper
        ? formatAudioTimestamp(chunk.timestamp[0])
        : `${chunk.durationMs.toFixed(0)}ms · ${chunk.audioDurationS.toFixed(1)}s`;
    const tone = isWhisper
        ? "border-blue-500/20 bg-blue-500/5"
        : "border-purple-500/20 bg-purple-500/5";
    const badgeTone = isWhisper
        ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
        : "bg-purple-500/15 text-purple-300 border-purple-500/30";
    const label = isWhisper ? "Whisper" : "Moonshine";

    return (
        <div
            className={`flex gap-3 rounded-lg p-3 border ${tone} transition-colors`}
        >
            <div className="flex flex-col items-start min-w-[5.5rem] flex-shrink-0">
                <span
                    className={`text-[10px] uppercase tracking-wider font-semibold rounded px-1.5 py-0.5 border ${badgeTone}`}
                >
                    {label}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-gray-400 mt-1">
                    {meta}
                </span>
            </div>
            <div className="text-sm text-gray-100 leading-relaxed flex-1 min-w-0">
                {chunk.text}
            </div>
        </div>
    );
}

function InfoCard({
    title,
    accent,
    children,
    gradient,
    border,
}: {
    title: string;
    accent: string;
    children: React.ReactNode;
    gradient?: string;
    border?: string;
}) {
    const base = gradient
        ? `bg-gradient-to-br ${gradient} ${border ?? "border-white/10"}`
        : "bg-gray-800 border-gray-700/50";
    return (
        <div className={`rounded-2xl p-5 sm:p-6 border ${base}`}>
            <SectionHeader accent={accent} title={title} />
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">{children}</div>
        </div>
    );
}

function StackRow({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="flex items-baseline gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider w-32 flex-shrink-0 ${tone}`}>
                {label}
            </span>
            <span className="text-sm text-gray-200">{value}</span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortenModel(id: string): string {
    const slash = id.lastIndexOf("/");
    return slash >= 0 ? id.slice(slash + 1) : id;
}

function backendDisplay(tab: EngineTab, moonshineBackend: MoonshineBackend): string {
    if (tab === "whisper") {
        // The Whisper worker is hardcoded to device: "webgpu" (see src/worker.js).
        // If WebGPU were unavailable, the page would have already shown the
        // "WebGPU not available" splash, so we know the Whisper run uses WebGPU.
        return "WebGPU";
    }
    if (!moonshineBackend) return "—";
    return moonshineBackend === "webgpu" ? "WebGPU" : "WASM";
}

function backendTone(tab: EngineTab, moonshineBackend: MoonshineBackend): Tone {
    if (tab === "whisper") return "emerald";
    if (!moonshineBackend) return "gray";
    return moonshineBackend === "webgpu" ? "emerald" : "amber";
}
