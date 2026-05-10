'use client';

import { useEffect, useRef, useState } from 'react';
import type { PortfolioKpi as PortfolioKpiData } from '@/data/portfolio';
import { useInView } from '@/hooks/useInView';

type Props = {
  kpi: PortfolioKpiData;
  delayMs?: number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PortfolioKpi({ kpi, delayMs = 0 }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [display, setDisplay] = useState<string>(
    kpi.numeric !== undefined ? formatNumeric(0, kpi) : kpi.value,
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    if (kpi.numeric === undefined || prefersReducedMotion()) {
      setDisplay(kpi.value);
      return;
    }

    const target = kpi.numeric;
    const duration = 1100;
    let raf = 0;
    let start = 0;

    const tick = (ts: number) => {
      if (!start) start = ts + delayMs;
      const elapsed = ts - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const current = target * eased;
      setDisplay(formatNumeric(current, kpi));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(kpi.value);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, kpi, delayMs]);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all duration-500 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(167,139,250,0.18), rgba(244,114,182,0.18))',
        }}
      />
      <div className="relative min-w-0">
        <div
          className="font-semibold tabular-nums text-xl sm:text-2xl tracking-tight truncate"
          style={{
            backgroundImage: 'var(--grad-brand-text)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          title={display}
        >
          {display}
        </div>
        <div className="mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-wider text-gray-400 leading-tight">
          {kpi.label}
        </div>
      </div>
    </div>
  );
}

function formatNumeric(current: number, kpi: PortfolioKpiData): string {
  const decimals = kpi.decimals ?? 0;
  const num = current.toFixed(decimals);
  return `${kpi.prefix ?? ''}${num}${kpi.suffix ?? ''}`;
}
