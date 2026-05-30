'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { PortfolioMedia, PortfolioProject } from '@/data/portfolio';
import { PortfolioKpi } from './portfolio-kpi';

type Props = {
  project: PortfolioProject;
  index: number;
  total: number;
  panelIndex: number;
  isActive: boolean;
  reducedMotion: boolean;
};

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

// Cyan/red/black scheme (matches the homepage). Headings use the cyan body
// gradient; thin accents (counter rule, bullets, hairlines) use a cyan→red
// blend so the second brand color is present without muddying large fills.
const GRADIENT_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(90deg,#a5f3fc 0%,#22d3ee 55%,#0891b2 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const ACCENT_LINE = 'linear-gradient(90deg,#22d3ee,#fb3b53)';

/**
 * Fine-grain noise texture — applied to the workbench surface and the panel
 * display so the whole panel reads as physical hardware (matte dark plastic)
 * rather than flat web color. Inline data-URL: no asset request, no opacity
 * layer to composite.
 */
const NOISE_BG: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/></svg>\")",
  backgroundRepeat: 'repeat',
};

/** Bezel material — same on the monitor and the spec panel. */
const BEZEL_BG = 'linear-gradient(180deg, #1d2029 0%, #0c0e13 100%)';

/**
 * One project = one full-viewport snap panel.
 *
 * Layout:
 *   - Desktop (lg+): two-column split. The project media is displayed inside a
 *     stylized monitor/device frame on the left, content (counter, title,
 *     paragraph, highlights, animated KPIs, tags) on the right.
 *   - Mobile: stacked. Compact device frame on top, content below.
 *
 * Each KPI carries its own `viz` (counter, percent-ring, progress-bar, gauge,
 * stamp, pulse, check) that plays once when the panel first becomes active.
 */
export const PortfolioCaseStudy = forwardRef<HTMLElement, Props>(
  function PortfolioCaseStudy(
    { project, index, total, panelIndex, isActive, reducedMotion },
    ref,
  ) {
    const revealed = isActive || reducedMotion;

    // Latch: media loads on first activation and stays loaded; KPIs play
    // their animations on first activation and stay played.
    const [played, setPlayed] = useState(reducedMotion);
    useEffect(() => {
      if (isActive) setPlayed(true);
    }, [isActive]);

    const counter = `${String(index + 1).padStart(2, '0')} / ${String(
      total,
    ).padStart(2, '0')}`;

    const reveal = (delay: number): React.CSSProperties =>
      reducedMotion ? {} : { transitionDelay: `${delay}ms` };
    const base = reducedMotion
      ? ''
      : 'transition-all duration-700 ease-out will-change-transform';
    const on = 'opacity-100 translate-y-0';
    const off = 'opacity-0 translate-y-4';

    return (
      <section
        ref={ref}
        data-panel-index={panelIndex}
        aria-labelledby={`project-${project.slug}-title`}
        className="relative flex h-[100svh] w-full snap-start items-center overflow-hidden px-3 pb-3 pt-[max(4.5rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-20 lg:px-8 xl:px-12"
      >
        {/* Shared brand glow behind the whole panel card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 18% 60%, rgba(34,211,238,0.16), transparent 65%), radial-gradient(50% 50% at 82% 40%, rgba(251,59,83,0.14), transparent 65%), radial-gradient(40% 40% at 50% 50%, rgba(14,116,144,0.12), transparent 60%)',
          }}
        />

        {/* Workbench card — opaque dark surface holding the two devices.
            No transparency, no glass. Fine noise texture so it reads as a
            physical matte surface (not flat web color). */}
        <div
          className={`relative mx-auto flex max-h-full w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ${base} ${
            revealed ? on : off
          }`}
          style={{ ...reveal(0), backgroundColor: '#0a0c12', ...NOISE_BG }}
        >
          {/* Cyan→red hairline along the top edge */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: ACCENT_LINE, opacity: 0.75 }}
          />
          {/* Subtle inner vignette to give the surface depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(80% 60% at 50% 50%, rgba(255,255,255,0.02), transparent 70%), linear-gradient(180deg, rgba(0,0,0,0.15), transparent 30%, rgba(0,0,0,0.25))',
            }}
          />

          <div className="relative grid h-full grid-cols-1 items-center gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8 xl:gap-12 xl:p-10">
            {/* ---------- Left: monitor with media ---------- */}
            <div className="relative min-h-0 flex-shrink-0 lg:col-span-7">
              <DeviceFrame
                media={project.media}
                active={isActive}
                loaded={played}
                label={counter}
              />
            </div>

            {/* ---------- Right: matching spec panel with content ---------- */}
            <div className="relative min-h-0 lg:col-span-5">
              <SpecPanel>
                {/* Counter */}
                <div
                  className={`flex items-center gap-3 ${base} ${
                    revealed ? on : off
                  }`}
                  style={reveal(80)}
                >
                  <span
                    aria-hidden
                    className="h-px w-7 flex-shrink-0 rounded-full"
                    style={{ background: ACCENT_LINE }}
                  />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                    {counter}
                  </span>
                </div>

                {/* Title */}
                <h2
                  id={`project-${project.slug}-title`}
                  className={`mt-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-[1.1] tracking-tight ${base} ${
                    revealed ? on : off
                  }`}
                  style={{ ...SERIF_STYLE, ...reveal(160) }}
                >
                  <span style={GRADIENT_TEXT}>{project.title}</span>
                </h2>

                {/* Role */}
                <p
                  className={`mt-2 text-[11px] font-medium uppercase tracking-[0.13em] text-gray-400 sm:text-xs ${base} ${
                    revealed ? on : off
                  }`}
                  style={reveal(240)}
                >
                  {project.role}
                </p>

                {/* Inset hairline divider — gives the panel structure */}
                <div
                  aria-hidden
                  className="mt-3 h-px w-full"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)',
                  }}
                />

                {/* Paragraph — clamped to keep the panel inside 100svh */}
                <p
                  className={`mt-3 line-clamp-3 text-[13px] leading-relaxed text-gray-300 sm:text-sm lg:line-clamp-4 lg:text-[14px] ${base} ${
                    revealed ? on : off
                  }`}
                  style={reveal(320)}
                >
                  {project.paragraph}
                </p>

                {/* Highlights */}
                <ul
                  className={`mt-3 hidden space-y-1.5 min-[420px]:block ${base} ${
                    revealed ? on : off
                  }`}
                  style={reveal(400)}
                >
                  {project.highlights.slice(0, 3).map((h) => (
                    <li
                      key={h}
                      className="flex gap-2.5 text-[12px] leading-snug text-gray-300 sm:text-[13px] lg:text-[13.5px]"
                    >
                      <span
                        aria-hidden
                        className="mt-[0.4rem] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: ACCENT_LINE }}
                      />
                      <span className="min-w-0 line-clamp-2">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* KPIs — each viz animates independently */}
                <div
                  className={`mt-4 grid gap-2.5 ${
                    project.kpis.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  {project.kpis.map((kpi, i) => (
                    <PortfolioKpi
                      key={kpi.label}
                      kpi={kpi}
                      play={played}
                      delayMs={300 + i * 160}
                    />
                  ))}
                </div>

                {/* Tags */}
                <div
                  className={`mt-3 hidden flex-wrap gap-1.5 min-[420px]:flex ${base} ${
                    revealed ? on : off
                  }`}
                  style={reveal(800)}
                >
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-gray-400 sm:text-[11px]"
                      style={{
                        background:
                          'linear-gradient(180deg, #14181f 0%, #0a0d13 100%)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </SpecPanel>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

/* ============================ Spec panel ============================ */

/**
 * The right-side "spec panel". Same bezel material as the monitor on the
 * left, but instead of a black screen showing video it has a textured dark
 * inner surface holding the project's specs (title, paragraph, highlights,
 * KPIs, tags). Reads as a paired display next to the monitor.
 */
function SpecPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Bezel — identical material to the monitor */}
      <div
        className="relative rounded-[20px] border border-white/10 p-[8px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:p-[10px]"
        style={{ background: BEZEL_BG, borderTopColor: 'rgba(255,255,255,0.14)' }}
      >
        {/* Top highlight strip — matches the monitor's cyan edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
          }}
        />

        {/* Display surface — opaque, textured, slightly inset */}
        <div
          className="relative overflow-hidden rounded-[12px] p-4 sm:p-5 lg:p-6"
          style={{
            backgroundColor: '#0d1118',
            backgroundImage:
              `linear-gradient(180deg, #11151d 0%, #0a0d13 100%), ${NOISE_BG.backgroundImage}`,
            backgroundRepeat: 'no-repeat, repeat',
            boxShadow:
              'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 28px rgba(0,0,0,0.55)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================ Device frame ============================ */

function DeviceFrame({
  media,
  active,
  loaded,
  label,
}: {
  media: PortfolioMedia;
  active: boolean;
  loaded: boolean;
  label: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Bezel — gains a cyan glow + brightened edge when the panel is live */}
      <div
        className="relative rounded-[20px] border p-[8px] transition-[box-shadow,border-color] duration-700 sm:p-[10px]"
        style={{
          background: 'linear-gradient(180deg, #1d2029 0%, #0c0e13 100%)',
          borderColor: active
            ? 'rgba(34,211,238,0.35)'
            : 'rgba(255,255,255,0.10)',
          borderTopColor: active
            ? 'rgba(34,211,238,0.5)'
            : 'rgba(255,255,255,0.14)',
          boxShadow: active
            ? '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 48px -12px rgba(34,211,238,0.45)'
            : '0 30px 80px -20px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top highlight strip */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(34,211,238,0.45), transparent)',
          }}
        />

        {/* Screen */}
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-black"
          style={{
            boxShadow:
              'inset 0 0 0 1px rgba(34,211,238,0.10), inset 0 0 24px rgba(0,0,0,0.6)',
          }}
        >
          <MediaInner media={media} inView={loaded} active={active} />

          {/* ---- HUD overlay (computer-vision "live feed" framing) ---- */}
          {/* Faint scanlines across the whole screen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.16) 3px, rgba(0,0,0,0) 4px)',
            }}
          />

          {/* Scanner sweep — only animates while the panel is live */}
          {active && (
            <div
              aria-hidden
              className="hud-sweep pointer-events-none absolute inset-x-0 top-0 h-1/3"
              style={{
                background:
                  'linear-gradient(180deg, transparent, rgba(34,211,238,0.20), transparent)',
              }}
            />
          )}

          {/* Camera-style corner brackets (draw in when live) */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <span
              key={c}
              aria-hidden
              className={`pointer-events-none absolute h-5 w-5 transition-all duration-700 ${
                active ? 'opacity-90' : 'opacity-40'
              } ${CORNER_POS[c]}`}
              style={{
                borderColor: 'rgba(34,211,238,0.85)',
                borderStyle: 'solid',
                borderTopWidth: c[0] === 't' ? 2 : 0,
                borderBottomWidth: c[0] === 'b' ? 2 : 0,
                borderLeftWidth: c[1] === 'l' ? 2 : 0,
                borderRightWidth: c[1] === 'r' ? 2 : 0,
                borderTopLeftRadius: c === 'tl' ? 6 : 0,
                borderTopRightRadius: c === 'tr' ? 6 : 0,
                borderBottomLeftRadius: c === 'bl' ? 6 : 0,
                borderBottomRightRadius: c === 'br' ? 6 : 0,
              }}
            />
          ))}

          {/* Live-feed status label, top-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-md border border-cyan-400/25 bg-[#05080b] px-2 py-1"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#fb3b53] ${
                active ? 'hud-rec' : ''
              }`}
            />
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
              LIVE · FEED {label}
            </span>
          </div>

          {/* Mono readout, bottom-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2.5 right-2.5 font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-cyan-200/55"
          >
            AI // VISION
          </div>

          {/* Subtle glass sheen across the screen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.05) 100%)',
            }}
          />
        </div>
      </div>

      {/* Stand */}
      <div className="mx-auto flex flex-col items-center">
        <div
          className="h-3 w-[26%] rounded-b-md border border-t-0 border-white/10"
          aria-hidden
          style={{ background: 'linear-gradient(180deg, #1a1d24, #0c0e13)' }}
        />
        <div
          className="mt-1 h-1 w-[44%] rounded-full"
          aria-hidden
          style={{ background: 'linear-gradient(180deg, #1a1d24, #0c0e13)' }}
        />
      </div>
    </div>
  );
}

/** Tailwind position utilities for the four screen corner brackets. */
const CORNER_POS = {
  tl: 'left-1.5 top-1.5',
  tr: 'right-1.5 top-1.5',
  bl: 'bottom-1.5 left-1.5',
  br: 'bottom-1.5 right-1.5',
} as const;

/* ============================== Media ============================== */

function MediaInner({
  media,
  inView,
  active,
}: {
  media: PortfolioMedia;
  /** Latched true once the panel has first been reached — gates the download. */
  inView: boolean;
  /** True only while this is the live snapped panel — gates the rotation. */
  active: boolean;
}) {
  const sizes = '(max-width: 1024px) 100vw, 50vw';

  if (media.kind === 'video') {
    return <ActiveVideo media={media} inView={inView} active={active} />;
  }
  if (media.kind === 'gif') {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media.src}
        alt={media.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  if (media.kind === 'image-rotation') {
    return (
      <RotatingImages
        srcs={media.srcs}
        alt={media.alt}
        intervalMs={media.intervalMs ?? 5000}
        sizes={sizes}
        active={active}
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

/**
 * Video that plays only while its panel is the active snapped panel. We keep
 * `src` set once the panel has been visited (so seek state is preserved and
 * the file isn't re-downloaded), but call `.pause()` whenever the panel goes
 * off-screen — otherwise two videos decode in parallel during a slow scroll
 * and stutter the active one.
 */
function ActiveVideo({
  media,
  inView,
  active,
}: {
  media: Extract<PortfolioMedia, { kind: 'video' }>;
  inView: boolean;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && inView) {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      v.pause();
    }
  }, [active, inView]);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      src={inView ? media.src : undefined}
      poster={media.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={media.alt}
    />
  );
}

function RotatingImages({
  srcs,
  alt,
  intervalMs,
  sizes,
  active,
}: {
  srcs: string[];
  alt: string;
  intervalMs: number;
  sizes: string;
  active: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (srcs.length < 2 || !active) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = window.setInterval(
      () => setCurrent((i) => (i + 1) % srcs.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [srcs.length, intervalMs, active]);

  return (
    <div className="absolute inset-0">
      {srcs.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ''}
          aria-hidden={i !== 0 || undefined}
          fill
          sizes={sizes}
          priority={i === 0}
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
