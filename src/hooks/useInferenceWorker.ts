"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInferenceWorkerOptions {
  workerFactory: () => Worker;
  enabled: boolean;
}

export interface UseInferenceWorkerReturn<TResult> {
  latestResult: TResult | null;
  isReady: boolean;
  error: string | null;
  backend: string | null;
  fps: number;
  loadedBytes: number;
  totalBytes: number;
  sendFrame: (bitmap: ImageBitmap, timestamp: number) => boolean;
  isBusy: () => boolean;
}

export function useInferenceWorker<TResult>({
  workerFactory,
  enabled,
}: UseInferenceWorkerOptions): UseInferenceWorkerReturn<TResult> {
  const workerRef = useRef<Worker | null>(null);
  const inFlightRef = useRef(false);
  const fpsTimesRef = useRef<number[]>([]);

  const [latestResult, setLatestResult] = useState<TResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const worker = workerFactory();
    workerRef.current = worker;
    inFlightRef.current = false;
    fpsTimesRef.current = [];
    setIsReady(false);
    setError(null);
    setBackend(null);
    setLatestResult(null);
    setFps(0);
    setLoadedBytes(0);
    setTotalBytes(0);

    const onMessage = (e: MessageEvent) => {
      const data = e.data as {
        type: string;
        result?: TResult;
        message?: string;
        backend?: string;
        loaded?: number;
        total?: number;
      };
      if (data.type === "ready") {
        setIsReady(true);
        if (data.backend) setBackend(data.backend);
      } else if (data.type === "progress") {
        if (typeof data.loaded === "number") setLoadedBytes(data.loaded);
        if (typeof data.total === "number") setTotalBytes(data.total);
      } else if (data.type === "result") {
        setLatestResult(data.result ?? null);
        inFlightRef.current = false;
        const now = performance.now();
        const buf = fpsTimesRef.current;
        buf.push(now);
        if (buf.length > 30) buf.shift();
        if (buf.length > 1) {
          const span = (buf[buf.length - 1] - buf[0]) / 1000;
          if (span > 0) setFps(Number(((buf.length - 1) / span).toFixed(1)));
        }
      } else if (data.type === "error") {
        setError(data.message ?? "Worker error");
        inFlightRef.current = false;
      }
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message || "Worker crashed";
      console.error("[inference worker error]", event);
      setError(msg);
      inFlightRef.current = false;
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ type: "init" });

    return () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      worker.terminate();
      workerRef.current = null;
      inFlightRef.current = false;
    };
  }, [enabled, workerFactory]);

  const sendFrame = useCallback(
    (bitmap: ImageBitmap, timestamp: number): boolean => {
      const worker = workerRef.current;
      if (!worker || !isReady || inFlightRef.current) {
        bitmap.close();
        return false;
      }
      inFlightRef.current = true;
      worker.postMessage({ type: "frame", bitmap, timestamp }, [bitmap]);
      return true;
    },
    [isReady],
  );

  const isBusy = useCallback(() => inFlightRef.current, []);

  return {
    latestResult,
    isReady,
    error,
    backend,
    fps,
    loadedBytes,
    totalBytes,
    sendFrame,
    isBusy,
  };
}
