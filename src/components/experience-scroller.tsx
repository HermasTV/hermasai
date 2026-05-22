'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PORTFOLIO } from '@/data/portfolio';
import { PortfolioCaseStudy } from './portfolio-case-study';
import { ExperienceHeroPanel } from './experience-hero-panel';
import { ExperienceContactPanel } from './experience-contact-panel';

/**
 * Full-viewport scroll-snap experience for the /experience page.
 *
 * The component itself is the snap scroll container: 100svh tall,
 * `overflow-y-scroll`, `scroll-snap-type: y mandatory`. Each child panel is
 * exactly one viewport (`100svh`) with `scroll-snap-align: start`.
 *
 * 7 panels: Hero · Project×5 · Contact.
 *
 * Scrolling stays 100% native — no wheel interception / scroll-jacking. Native
 * scroll, trackpad, keyboard (Page Up/Down, arrows, Space) and touch all work.
 * A vertical progress rail tracks the active panel and lets users jump.
 */

const PANEL_COUNT = PORTFOLIO.length + 2; // Hero + projects + Contact

const PANEL_LABELS = [
  'Introduction',
  ...PORTFOLIO.map((p) => p.title),
  'Get in touch',
];

export function ExperienceScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Track which panel is centred in the snap container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.panelIndex,
            );
            if (!Number.isNaN(idx)) setActive(idx);
          }
        }
      },
      // A panel becomes "active" once it covers the middle ~half of the
      // viewport — robust to the brief moment two panels are both visible.
      { root: container, threshold: 0.6 },
    );

    const nodes = panelRefs.current.filter(Boolean) as HTMLElement[];
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  // Respect reduced-motion: keep snapping (not vestibular-triggering) but
  // drop smooth-scroll easing so jumps resolve instantly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const node = panelRefs.current[index];
      if (!node) return;
      node.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [reducedMotion],
  );

  const setPanelRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      panelRefs.current[index] = el;
    },
    [],
  );

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="experience-snap relative h-[100svh] w-full overflow-x-hidden overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: reducedMotion ? 'auto' : 'smooth',
        }}
      >
        {/* Panel 1 — Hero */}
        <ExperienceHeroPanel
          ref={setPanelRef(0)}
          panelIndex={0}
          isActive={active === 0}
          reducedMotion={reducedMotion}
          onScrollHint={() => goTo(1)}
        />

        {/* Panels 2–6 — one project each */}
        {PORTFOLIO.map((project, i) => (
          <PortfolioCaseStudy
            key={project.slug}
            ref={setPanelRef(i + 1)}
            panelIndex={i + 1}
            project={project}
            index={i}
            total={PORTFOLIO.length}
            isActive={active === i + 1}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* Final panel — Contact (footer content folded in) */}
        <ExperienceContactPanel
          ref={setPanelRef(PANEL_COUNT - 1)}
          panelIndex={PANEL_COUNT - 1}
          isActive={active === PANEL_COUNT - 1}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Vertical progress rail — fixed over the panels. */}
      <ProgressRail
        count={PANEL_COUNT}
        active={active}
        labels={PANEL_LABELS}
        onJump={goTo}
      />
    </div>
  );
}

/* ----------------------- Vertical progress rail ----------------------- */

function ProgressRail({
  count,
  active,
  labels,
  onJump,
}: {
  count: number;
  active: number;
  labels: string[];
  onJump: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Panel navigation"
      className="pointer-events-none fixed right-3 top-1/2 z-40 -translate-y-1/2 sm:right-5 md:right-6"
    >
      <ul className="flex flex-col items-center gap-2.5 sm:gap-3">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === active;
          return (
            <li key={i} className="pointer-events-auto">
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Go to panel ${i + 1} of ${count}: ${labels[i]}`}
                aria-current={isActive ? 'true' : undefined}
                className="group relative flex h-6 w-6 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
              >
                {/* Dot / active tick */}
                <span
                  aria-hidden
                  className={`block rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? 'h-2.5 w-2.5'
                      : 'h-1.5 w-1.5 bg-white/25 group-hover:bg-white/55'
                  }`}
                  style={
                    isActive
                      ? { backgroundImage: 'var(--grad-brand-cta)' }
                      : undefined
                  }
                />
                {/* Tooltip label — desktop pointer users only */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/90 px-2.5 py-1 text-xs font-medium text-gray-200 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 lg:block"
                >
                  {labels[i]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
