'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  KpiViz,
  PortfolioKpi as PortfolioKpiData,
} from '@/data/portfolio';

type Props = {
  kpi: PortfolioKpiData;
  /** True once the parent panel has been the active panel — triggers the animation. */
  play: boolean;
  /** Delay before this KPI starts animating (ms). */
  delayMs?: number;
};

/**
 * A KPI chip on an /experience project panel. The visualization is picked by
 * `kpi.viz` and animates once when `play` flips true. Animations are designed
 * to run to completion without depending on `play` flipping back — so a fast
 * scroll never leaves them mid-way.
 */
export function PortfolioKpi({ kpi, play, delayMs = 0 }: Props) {
  const viz = resolveViz(kpi);
  return (
    <div
      className="relative min-w-0 overflow-hidden rounded-xl border border-white/10 p-3 sm:p-3.5"
      style={{
        // Solid dark inset well — opaque, matches the spec-panel theme.
        background: 'linear-gradient(180deg, #0c0f15 0%, #06080c 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 18px rgba(0,0,0,0.45)',
      }}
    >
      <div className="relative flex flex-col items-center text-center">
        <KpiVisual kpi={kpi} viz={viz} play={play} delayMs={delayMs} />
        <div className="mt-2 w-full min-w-0">
          <KpiValue kpi={kpi} viz={viz} play={play} delayMs={delayMs} />
          <div className="mt-1 line-clamp-2 text-[10px] font-medium uppercase leading-snug tracking-wider text-gray-400 sm:text-[11px]">
            {kpi.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveViz(kpi: PortfolioKpiData): KpiViz {
  if (kpi.viz) return kpi.viz;
  return kpi.numeric !== undefined ? 'counter' : 'pulse';
}

/* ----------------------------- Value text ----------------------------- */

function KpiValue({
  kpi,
  viz,
  play,
  delayMs,
}: {
  kpi: PortfolioKpiData;
  viz: KpiViz;
  play: boolean;
  delayMs: number;
}) {
  // For numeric vizzes that benefit from a count-up, animate the displayed
  // number. For the rest, just show the final value.
  const wantsCount =
    (viz === 'counter' || viz === 'percent-ring' || viz === 'gauge') &&
    kpi.numeric !== undefined;
  const display = useCountUp(
    wantsCount ? kpi.numeric ?? 0 : null,
    play,
    delayMs,
    kpi,
  );
  const text = wantsCount ? display : kpi.value;
  return (
    <div
      className="w-full whitespace-nowrap text-center text-[clamp(0.95rem,1.4vw,1.25rem)] font-semibold tabular-nums tracking-tight"
      style={{
        backgroundImage:
          'linear-gradient(90deg,#a5f3fc 0%,#22d3ee 55%,#0891b2 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      title={kpi.value}
    >
      {text}
    </div>
  );
}

/* ----------------------------- Visualizations ----------------------------- */

const VIZ_SIZE = 'h-9 w-9 sm:h-10 sm:w-10';

function KpiVisual({
  kpi,
  viz,
  play,
  delayMs,
}: {
  kpi: PortfolioKpiData;
  viz: KpiViz;
  play: boolean;
  delayMs: number;
}) {
  switch (viz) {
    case 'percent-ring':
      return <PercentRing target={kpi.numeric ?? 0} play={play} delayMs={delayMs} />;
    case 'progress-bar':
      return <ProgressBar target={kpi.numeric ?? 0} play={play} delayMs={delayMs} />;
    case 'gauge':
      return (
        <Gauge target={kpi.numeric ?? 0} max={kpi.max ?? 100} play={play} delayMs={delayMs} />
      );
    case 'stamp':
      return <Stamp play={play} delayMs={delayMs} />;
    case 'pulse':
      return <PulseDot play={play} />;
    case 'check':
      return <CheckMark play={play} delayMs={delayMs} />;
    case 'counter':
    default:
      return <CounterGlyph play={play} delayMs={delayMs} />;
  }
}

/* ---- Percent ring (SVG circle dasharray) ---- */
function PercentRing({
  target,
  play,
  delayMs,
}: {
  target: number;
  play: boolean;
  delayMs: number;
}) {
  const progress = useAnimatedNumber(target, play, delayMs, { max: 100 });
  const r = 14;
  const c = 2 * Math.PI * r;
  const dash = c * (Math.min(100, progress) / 100);
  return (
    <svg viewBox="0 0 36 36" className={VIZ_SIZE} aria-hidden>
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#fb3b53" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dasharray 80ms linear' }}
      />
    </svg>
  );
}

/* ---- Progress bar (small horizontal bar) ---- */
function ProgressBar({
  target,
  play,
  delayMs,
}: {
  target: number;
  play: boolean;
  delayMs: number;
}) {
  const progress = useAnimatedNumber(target, play, delayMs, { max: 100 });
  return (
    <div className={`relative ${VIZ_SIZE} flex flex-col justify-end`}>
      <div className="space-y-1.5 px-0.5">
        {[0.4, 0.7, 1].map((mult, i) => {
          const w = Math.min(100, progress * mult);
          return (
            <div
              key={i}
              className="h-1 overflow-hidden rounded-full bg-gray-700"
              aria-hidden
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${w}%`,
                  background: 'linear-gradient(90deg,#22d3ee,#fb3b53)',
                  transition: 'width 80ms linear',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Gauge (semi-circular speedometer needle) ---- */
function Gauge({
  target,
  max,
  play,
  delayMs,
}: {
  target: number;
  max: number;
  play: boolean;
  delayMs: number;
}) {
  const value = useAnimatedNumber(target, play, delayMs, { max });
  const angle = -90 + (Math.min(max, value) / max) * 180;
  return (
    <svg viewBox="0 0 40 24" className={VIZ_SIZE} aria-hidden>
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#fb3b53" />
        </linearGradient>
      </defs>
      <path
        d="M4 20 A 16 16 0 0 1 36 20"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M4 20 A 16 16 0 0 1 36 20"
        fill="none"
        stroke="url(#gauge-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="50.27"
        strokeDashoffset={50.27 - (50.27 * (Math.min(max, value) / max))}
        style={{ transition: 'stroke-dashoffset 80ms linear' }}
      />
      <g transform={`rotate(${angle} 20 20)`} style={{ transition: 'transform 80ms linear' }}>
        <line x1="20" y1="20" x2="20" y2="8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1.6" fill="#fff" />
      </g>
    </svg>
  );
}

/* ---- Certification stamp ---- */
function Stamp({ play, delayMs }: { play: boolean; delayMs: number }) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    if (!play) return;
    const t = window.setTimeout(() => setStamped(true), delayMs);
    return () => window.clearTimeout(t);
  }, [play, delayMs]);
  return (
    <div className={`relative ${VIZ_SIZE}`} aria-hidden>
      <div
        className="absolute inset-0 grid place-items-center rounded-full border-2"
        style={{
          borderColor: '#22d3ee',
          transform: stamped ? 'scale(1) rotate(-12deg)' : 'scale(2.2) rotate(20deg)',
          opacity: stamped ? 1 : 0,
          transition:
            'transform 600ms cubic-bezier(0.2, 1.4, 0.4, 1), opacity 400ms ease-out',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            d="M9 12.5 L11 14.5 L15.5 9.5"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 14,
              strokeDashoffset: stamped ? 0 : 14,
              transition: 'stroke-dashoffset 500ms 200ms ease-out',
            }}
          />
        </svg>
      </div>
    </div>
  );
}

/* ---- Pulse dot for live / uptime states ---- */
function PulseDot({ play }: { play: boolean }) {
  return (
    <div className={`relative grid place-items-center ${VIZ_SIZE}`} aria-hidden>
      <span
        className="absolute h-4 w-4 rounded-full"
        style={{
          background: '#22c55e',
          opacity: 0.35,
          animation: play ? 'kpiPulseRing 1.6s ease-out infinite' : 'none',
        }}
      />
      <span
        className="relative h-2.5 w-2.5 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.7)]"
        style={{ background: '#22c55e' }}
      />
      <style>{`
        @keyframes kpiPulseRing {
          0%   { transform: scale(0.6); opacity: 0.55; }
          80%  { transform: scale(2.0); opacity: 0;    }
          100% { transform: scale(2.0); opacity: 0;    }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes kpiPulseRing { 0%, 100% { transform: scale(1); opacity: 0.4; } }
        }
      `}</style>
    </div>
  );
}

/* ---- Checkmark (stroke draw) ---- */
function CheckMark({ play, delayMs }: { play: boolean; delayMs: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!play) return;
    const t = window.setTimeout(() => setDrawn(true), delayMs);
    return () => window.clearTimeout(t);
  }, [play, delayMs]);
  return (
    <div className={`grid place-items-center ${VIZ_SIZE}`} aria-hidden>
      <svg viewBox="0 0 36 36" className="h-full w-full">
        <defs>
          <linearGradient id="check-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <path
          d="M10 18 L16 24 L26 13"
          fill="none"
          stroke="url(#check-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 28,
            strokeDashoffset: drawn ? 0 : 28,
            transition: 'stroke-dashoffset 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
          }}
        />
      </svg>
    </div>
  );
}

/* ---- Counter glyph: ascending bar chart with sweep-in animation ---- */
function CounterGlyph({ play, delayMs }: { play: boolean; delayMs: number }) {
  // Three vertical bars + an upward trend arrow. The bars rise into their
  // final heights on play; the arrow's stroke draws across the tops.
  const bars = [
    { h: 30, d: 0 },
    { h: 60, d: 120 },
    { h: 100, d: 240 },
  ];
  return (
    <div className={`relative ${VIZ_SIZE}`} aria-hidden>
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <defs>
          <linearGradient id="bars-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fb3b53" />
          </linearGradient>
        </defs>
        {/* Baseline */}
        <line
          x1="4"
          y1="34"
          x2="36"
          y2="34"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        {bars.map((b, i) => {
          const fullH = 22 * (b.h / 100);
          return (
            <rect
              key={i}
              x={6 + i * 11}
              y={34 - fullH}
              width="7"
              height={fullH}
              rx="1.5"
              fill="url(#bars-grad)"
              style={{
                transformOrigin: `${9.5 + i * 11}px 34px`,
                transform: play ? 'scaleY(1)' : 'scaleY(0)',
                transition: `transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delayMs + b.d}ms`,
              }}
            />
          );
        })}
        {/* Trend arrow across the top of the bars */}
        <path
          d="M9.5 23 L20.5 14 L31.5 7"
          fill="none"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 32,
            strokeDashoffset: play ? 0 : 32,
            transition: `stroke-dashoffset 600ms ease-out ${delayMs + 500}ms`,
          }}
        />
        <circle
          cx="31.5"
          cy="7"
          r="1.6"
          fill="#fff"
          style={{
            opacity: play ? 1 : 0,
            transition: `opacity 300ms ease-out ${delayMs + 1000}ms`,
          }}
        />
      </svg>
    </div>
  );
}

/* ----------------------------- Hooks ----------------------------- */

/**
 * Drive a number from 0 → target with ease-out. Resilient: if `play` flips
 * during the animation, we always land on `target` instead of freezing.
 */
function useAnimatedNumber(
  target: number,
  play: boolean,
  delayMs: number,
  opts: { max?: number; durationMs?: number } = {},
): number {
  const { durationMs = 1100 } = opts;
  const [value, setValue] = useState(0);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!play) return;
    if (playedRef.current) {
      setValue(target);
      return;
    }
    playedRef.current = true;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts + delayMs;
      const elapsed = ts - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // If unmounted before completion, still land on target — prevents the
      // KPI from looking frozen mid-count after a fast scroll.
      setValue(target);
    };
  }, [play, target, delayMs, durationMs]);

  return value;
}

function useCountUp(
  target: number | null,
  play: boolean,
  delayMs: number,
  kpi: PortfolioKpiData,
): string {
  const n = useAnimatedNumber(target ?? 0, play, delayMs);
  if (target === null) return kpi.value;
  // Once the animation is essentially done, render the canonical value text
  // (preserves any non-numeric trailing like "+" in "5000+").
  const finished = Math.abs(n - target) < 0.01;
  if (finished) return kpi.value;
  return `${kpi.prefix ?? ''}${n.toFixed(kpi.decimals ?? 0)}${kpi.suffix ?? ''}`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
