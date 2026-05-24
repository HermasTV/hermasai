'use client';

import { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import type { PortfolioMedia, PortfolioProject } from '@/data/portfolio';
import { PortfolioKpi } from './portfolio-kpi';

type Props = {
  project: PortfolioProject;
  index: number;
  /** Total number of case studies — used for the "01 / 05" counter. */
  total: number;
  /** Index of this panel within the 7-panel snap sequence. */
  panelIndex: number;
  /** True while this panel is the active/snapped panel. */
  isActive: boolean;
  reducedMotion: boolean;
};

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

const GRADIENT_TEXT: React.CSSProperties = {
  backgroundImage: 'var(--grad-brand-text)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

/**
 * One project = one full-viewport snap panel.
 *
 * Layout: the project media is a **full-bleed background** filling the entire
 * `100svh` panel (bigger than it has ever been). A gradient scrim guarantees
 * contrast, and a glassmorphism content band carries every piece of the
 * project's content — counter, title, role, paragraph, highlights, KPIs, tags.
 *
 * - Mobile: content sits in a bottom sheet (heavy scrim from below).
 * - Desktop (lg+): content is a left-anchored vertical glass panel; media
 *   fills the rest of the viewport.
 *
 * Nothing scrolls inside the panel — content is tuned to fit a ~360×640 phone.
 */
export const PortfolioCaseStudy = forwardRef<HTMLElement, Props>(
  function PortfolioCaseStudy(
    { project, index, total, panelIndex, isActive, reducedMotion },
    ref,
  ) {
    const revealed = isActive || reducedMotion;

    // Media loads once the panel is first reached, then stays loaded — so a
    // video keeps playing and an image keeps its decode even after the user
    // scrolls past and back. Without the latch, `isActive` flipping false
    // would unload the <video> src.
    const [mediaLoaded, setMediaLoaded] = useState(false);
    useEffect(() => {
      if (isActive) setMediaLoaded(true);
    }, [isActive]);

    const base = reducedMotion
      ? ''
      : 'transition-all duration-700 ease-out will-change-transform';
    const on = 'opacity-100 translate-y-0';
    const off = 'opacity-0 translate-y-6';
    const reveal = (delay: number): React.CSSProperties =>
      reducedMotion ? {} : { transitionDelay: `${delay}ms` };

    const counter = `${String(index + 1).padStart(2, '0')} / ${String(
      total,
    ).padStart(2, '0')}`;

    return (
      <section
        ref={ref}
        data-panel-index={panelIndex}
        aria-labelledby={`project-${project.slug}-title`}
        className="relative flex h-[100svh] w-full snap-start overflow-hidden"
      >
        {/* ---------- Full-bleed media background ---------- */}
        <div className="absolute inset-0">
          <MediaInner media={project.media} inView={mediaLoaded} active={isActive} />
        </div>

        {/* ---------- Scrims for text legibility ---------- */}
        {/* Mobile: strong bottom-up scrim. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(to top, rgba(7,9,14,0.96) 0%, rgba(7,9,14,0.86) 32%, rgba(7,9,14,0.35) 62%, rgba(7,9,14,0.15) 100%)',
          }}
        />
        {/* Desktop: left-to-right scrim behind the side panel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(to right, rgba(7,9,14,0.95) 0%, rgba(7,9,14,0.8) 34%, rgba(7,9,14,0.2) 58%, transparent 80%)',
          }}
        />
        {/* Subtle inner ring framing the viewport. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]"
        />

        {/* ---------- Content band ---------- */}
        <div className="relative flex w-full items-end lg:items-center">
          <div
            className={`w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-6 sm:pt-10 lg:max-w-xl lg:px-0 lg:py-0 lg:pl-10 xl:max-w-2xl xl:pl-16 2xl:pl-24`}
          >
            <div
              className={`relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--bg-glass-80)] p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:mx-0 lg:p-7 xl:p-8 ${base} ${
                revealed ? on : off
              }`}
              style={reveal(80)}
            >
              {/* Brand hairline along the top edge */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: 'var(--grad-brand-text)', opacity: 0.7 }}
              />

              {/* Counter */}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-px w-7 flex-shrink-0 rounded-full"
                  style={{ background: 'var(--grad-brand-cta)' }}
                />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                  {counter}
                </span>
              </div>

              {/* Title */}
              <h2
                id={`project-${project.slug}-title`}
                className="mt-2.5 text-[clamp(1.5rem,3.6vw,2.5rem)] font-semibold leading-[1.1] tracking-tight"
                style={SERIF_STYLE}
              >
                <span style={GRADIENT_TEXT}>{project.title}</span>
              </h2>

              {/* Role */}
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.13em] text-gray-400 sm:text-xs">
                {project.role}
              </p>

              {/* Paragraph — clamped so it never blows the panel height */}
              <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-gray-300 sm:line-clamp-none sm:text-sm lg:text-[15px]">
                {project.paragraph}
              </p>

              {/* Highlights — hidden on the shortest phones to guarantee fit */}
              <ul className="mt-3.5 hidden space-y-1.5 min-[400px]:block">
                {project.highlights.slice(0, 3).map((h) => (
                  <li
                    key={h}
                    className="flex gap-2.5 text-[12px] leading-snug text-gray-300 sm:text-[13px] lg:text-sm"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.4rem] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: 'var(--grad-brand-cta)' }}
                    />
                    <span className="min-w-0 line-clamp-2 sm:line-clamp-none">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>

              {/* KPIs — column count tracks the 2-or-3 KPIs per project */}
              <div
                className={`mt-4 grid gap-2 sm:gap-2.5 ${
                  project.kpis.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {project.kpis.map((kpi) => (
                  <PortfolioKpi key={kpi.label} kpi={kpi} />
                ))}
              </div>

              {/* Tags */}
              <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-gray-400 sm:text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

/* ----------------------------- Media ----------------------------- */

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
  // Full-bleed background — cover the whole viewport panel.
  const sizes = '100vw';

  if (media.kind === 'video') {
    return (
      <video
        className="h-full w-full object-cover"
        // Defer the download until the panel has first been reached, then
        // keep the src so it stays loaded when scrolled past and back.
        src={inView ? media.src : undefined}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
    );
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
  /** Only cross-fade while the panel is the active one. */
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
