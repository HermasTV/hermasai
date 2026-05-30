'use client';

import { forwardRef } from 'react';

/**
 * Panel 1 of the /experience snap experience — the intro Hero.
 *
 * Re-fits the former page Hero into exactly one `100svh` snap panel: a single
 * centred column (eyebrow → serif gradient title → role → intro → pills) plus
 * a subtle "scroll for projects" affordance pinned near the bottom.
 */

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

const GRADIENT_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(90deg,#a5f3fc 0%,#22d3ee 55%,#0891b2 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const ACCENT_LINE = 'linear-gradient(90deg,#22d3ee,#fb3b53)';

type Props = {
  panelIndex: number;
  isActive: boolean;
  reducedMotion: boolean;
  onScrollHint: () => void;
};

const PILLS = [
  '12+ Live Projects',
  '8+ Corporate Clients',
  'Agentic AI',
  'Edge Optimization',
  '3D Computer Vision',
];

export const ExperienceHeroPanel = forwardRef<HTMLElement, Props>(
  function ExperienceHeroPanel(
    { panelIndex, isActive, reducedMotion, onScrollHint },
    ref,
  ) {
    // Entrance reveal: animate once the panel is active, unless reduced motion.
    const revealed = isActive || reducedMotion;
    const base = reducedMotion
      ? ''
      : 'transition-all duration-700 ease-out will-change-transform';
    const on = 'opacity-100 translate-y-0';
    const off = 'opacity-0 translate-y-6';
    const reveal = (delay: number): React.CSSProperties =>
      reducedMotion ? {} : { transitionDelay: `${delay}ms` };

    return (
      <section
        ref={ref}
        data-panel-index={panelIndex}
        aria-labelledby="experience-hero-title"
        className="relative flex h-[100svh] w-full snap-start items-center justify-center overflow-hidden px-5 sm:px-8"
      >
        {/* Ambient orbs framing the centred column */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="hero-orb-a absolute -left-32 top-[8%] h-[44vmin] w-[44vmin] rounded-full opacity-30 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 60%)',
            }}
          />
          <div
            className="hero-orb-b absolute -right-24 top-[26%] h-[48vmin] w-[48vmin] rounded-full opacity-25 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #fb3b53 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute left-1/2 top-[40%] h-[40vmin] w-[40vmin] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #0891b2 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Centred content column */}
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {/* Eyebrow */}
          <div
            className={`flex flex-col items-center ${base} ${
              revealed ? on : off
            }`}
            style={reveal(0)}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-300 sm:text-sm">
              Selected Work · 2018–2025
            </span>
            <span
              aria-hidden
              className="hero-underline mt-2 h-[2px] w-28 rounded-full sm:w-32"
              style={{ background: ACCENT_LINE }}
            />
          </div>

          {/* Title */}
          <h1
            id="experience-hero-title"
            className={`mt-6 text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.95] tracking-tight ${base} ${
              revealed ? on : off
            }`}
            style={{ ...SERIF_STYLE, ...reveal(90) }}
          >
            <span style={GRADIENT_TEXT}>Ahmed Hermas</span>
          </h1>

          {/* Role */}
          <p
            className={`mt-4 text-lg font-medium text-gray-200 sm:text-xl md:text-2xl ${base} ${
              revealed ? on : off
            }`}
            style={reveal(170)}
          >
            Senior AI Engineer
          </p>

          {/* Intro */}
          <p
            className={`mt-5 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg ${base} ${
              revealed ? on : off
            }`}
            style={reveal(250)}
          >
            Seven years colaborating and leading teams, building real-world computer-vision
            systems, from ISO-certified biometrics to city-scale traffic AI to
            Agentic AI to 3D vehicle reconstruction. Below are the projects I shipped.
          </p>

          {/* Pills */}
          <div
            className={`mt-7 flex flex-wrap justify-center gap-2 text-xs sm:gap-3 sm:text-sm ${base} ${
              revealed ? on : off
            }`}
            style={reveal(330)}
          >
            {PILLS.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/10 bg-[#0f141b] px-3 py-1.5 font-medium text-gray-300"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll affordance — jumps to the first project */}
        <button
          type="button"
          onClick={onScrollHint}
          aria-label="Scroll to projects"
          className={`group absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-full px-3 py-2 text-gray-400 transition-colors duration-300 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${base} ${
            revealed ? on : off
          }`}
          style={reveal(440)}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
            Scroll for projects
          </span>
          <svg
            aria-hidden
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={reducedMotion ? '' : 'experience-scroll-bob'}
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      </section>
    );
  },
);
