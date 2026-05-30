'use client';

import { useEffect, useRef, useState } from 'react';
import TechLogoField from './tech-logo-field';

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

/** The verbatim signature line — must not change a word. */
const SIGNATURE = 'Welcome to my Virtual Garage for AI experiments.';

/**
 * useTypedLine
 * ------------
 * A small, considered typing effect: characters resolve in one at a time
 * with a slight easing on the cadence (faster mid-word, a brief breath on
 * spaces and punctuation), so it feels deliberate rather than mechanical.
 *
 * Returns the number of characters currently revealed and whether typing
 * has finished. Under prefers-reduced-motion it resolves immediately to the
 * full, final, static state.
 */
function useTypedLine(text: string, startDelay: number) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) {
      setCount(text.length);
      setDone(true);
      return;
    }

    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    // Per-character cadence: punctuation gets a longer beat, spaces a short
    // one, regular letters get a hair of randomness so it feels human-typed.
    const delayFor = (ch: string) => {
      if ('.,'.includes(ch)) return 220;
      if (ch === ' ') return 60;
      return 34 + Math.random() * 26;
    };

    const tick = () => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        setDone(true);
        return;
      }
      timer = setTimeout(tick, delayFor(text[i]));
    };

    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, [text, startDelay]);

  return { count, done };
}

/**
 * HomeHero
 * --------
 * The minimal centered overlay for the HermasAI homepage. The only copy on
 * the entire page lives here: the brand wordmark "HermasAI" (the single h1)
 * and the verbatim signature line, presented with a polished typing effect.
 *
 * It sits above the full-bleed TechLogoField — an ambient, drifting
 * constellation of the user's tech stack — vertically centered in the
 * viewport. A soft radial scrim keeps the text legible over the busiest
 * part of the field without hiding the motion. No eyebrow, no scroll cue,
 * no CTAs — this is a pure identity statement.
 */
export default function HomeHero() {
  const { count, done } = useTypedLine(SIGNATURE, 1100);
  const liveRef = useRef<HTMLSpanElement>(null);

  return (
    <section
      className="relative flex w-full flex-1 items-center justify-center overflow-hidden"
      aria-label="HermasAI — a virtual garage for AI experiments"
    >
      {/* Decorative full-bleed ambient background — a drifting field of
          ~30 tech-stack logos. Non-interactive, behind the text. */}
      <TechLogoField />

      {/* Soft radial scrim — keeps the centered text legible over the
          logo field, without masking the motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 56% 46% at 50% 50%, rgba(8,8,14,0.74) 0%, rgba(8,8,14,0.34) 46%, transparent 78%)',
        }}
      />

      {/* Text column */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-5 text-center sm:px-6">
        {/* Brand wordmark — the single h1 for the page. A neon, AI-textured
            treatment: "Hermas" in dark cyan, "AI" in red. Each word is filled
            with a drifting scan-line texture (clipped to the glyphs) under a
            neon glow, swept periodically by a scanner highlight — a nod to the
            computer-vision work the portfolio is built on. */}
        <h1
          className="neon-wordmark text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
          style={SERIF_STYLE}
        >
          <span className="neon neon--cyan" data-text="Hermas">
            Hermas
          </span>
          <span className="neon neon--red" data-text="AI">
            AI
          </span>
        </h1>

        {/* Signature line — verbatim, with the considered typing effect.
            aria-label carries the full sentence for assistive tech while
            the visible span reveals it character by character. */}
        <p
          className="hero-fade-2 mt-6 min-h-[3.5rem] max-w-md text-base italic leading-relaxed text-gray-300 sm:mt-7 sm:min-h-[2.25rem] sm:max-w-none sm:text-xl"
          style={SERIF_STYLE}
        >
          <span aria-label={SIGNATURE} role="text">
            <span ref={liveRef} aria-hidden>
              {SIGNATURE.slice(0, count)}
            </span>
            <span
              aria-hidden
              className={`type-caret ${done ? 'type-caret--idle' : ''}`}
            />
          </span>
        </p>
      </div>

      {/* Page-scoped animation idiom. Honors prefers-reduced-motion:
          everything settles into its final state with no looping motion. */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-2 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.7s both; }

        /* ============================================================
           Neon wordmark — "Hermas" (dark cyan) + "AI" (red)
           ============================================================ */
        .neon-wordmark {
          display: inline-flex;
          align-items: baseline;
          /* power-on flicker, once, then settle lit */
          animation: neonOn 1.1s steps(1, end) 0.1s both;
        }

        .neon {
          position: relative;
          /* fill = drifting scan-line texture + a vertical color gradient,
             both clipped to the glyph shapes */
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-repeat: no-repeat;
          background-size: 100% 7px, 100% 100%;
          background-position: 0 0, 0 0;
          /* slow texture drift — the scan-lines crawl through the letters */
          animation: scanDrift 5.5s linear infinite;
        }

        /* "Hermas" — dark cyan / blueish neon */
        .neon--cyan {
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0) 0px,
              rgba(0,0,0,0) 2px,
              rgba(2,18,24,0.55) 3px,
              rgba(0,0,0,0) 4px
            ),
            linear-gradient(180deg, #a5f3fc 0%, #22d3ee 46%, #0e7490 100%);
          filter:
            drop-shadow(0 0 3px rgba(34,211,238,0.5))
            drop-shadow(0 0 9px rgba(34,211,238,0.28));
          animation: scanDrift 5.5s linear infinite, glowCyan 3.6s ease-in-out infinite;
        }

        /* "AI" — red neon */
        .neon--red {
          margin-left: 0.04em;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0) 0px,
              rgba(0,0,0,0) 2px,
              rgba(28,2,4,0.55) 3px,
              rgba(0,0,0,0) 4px
            ),
            linear-gradient(180deg, #fecaca 0%, #fb3b53 48%, #991b1b 100%);
          filter:
            drop-shadow(0 0 3px rgba(244,63,82,0.5))
            drop-shadow(0 0 9px rgba(244,63,82,0.28));
          animation: scanDrift 6.2s linear infinite, glowRed 4s ease-in-out infinite;
        }

        /* scanner sweep — a bright band passing across the glyphs */
        .neon::before {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-repeat: no-repeat;
          background-size: 220% 100%;
          background-position: 120% 0;
          background-image: linear-gradient(
            110deg,
            transparent 42%,
            rgba(255,255,255,0.85) 50%,
            transparent 58%
          );
          animation: neonSweep 6.5s ease-in-out infinite;
        }
        .neon--red::before { animation-delay: 0.5s; }

        @keyframes scanDrift {
          to { background-position: 0 7px, 0 0; }
        }
        @keyframes neonSweep {
          0%, 14% { background-position: 120% 0; }
          40%, 100% { background-position: -120% 0; }
        }
        @keyframes glowCyan {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(34,211,238,0.5)) drop-shadow(0 0 9px rgba(34,211,238,0.26)); }
          50%      { filter: drop-shadow(0 0 4px rgba(34,211,238,0.62)) drop-shadow(0 0 13px rgba(34,211,238,0.36)); }
        }
        @keyframes glowRed {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(244,63,82,0.5)) drop-shadow(0 0 9px rgba(244,63,82,0.26)); }
          50%      { filter: drop-shadow(0 0 4px rgba(244,63,82,0.62)) drop-shadow(0 0 13px rgba(244,63,82,0.36)); }
        }
        /* neon tube powering on: a couple of stutters, then steady */
        @keyframes neonOn {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          12%  { opacity: 0.25; }
          18%  { opacity: 1; }
          24%  { opacity: 0.4; }
          30%  { opacity: 1; }
          100% { opacity: 1; }
        }

        /* Typing caret — slim cyan neon bar, eased blink. */
        .type-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 3px;
          vertical-align: -0.16em;
          border-radius: 2px;
          background: linear-gradient(180deg, #a5f3fc, #22d3ee);
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
          animation: caretPulse 1.05s ease-in-out infinite;
        }
        .type-caret--idle { animation: caretIdle 2.4s ease-in-out infinite; }
        @keyframes caretPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes caretIdle {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.08; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-2 { animation: none; opacity: 1; transform: none; }
          /* steady lit neon — no flicker, drift, sweep or glow pulse */
          .neon-wordmark { animation: none; opacity: 1; }
          .neon { animation: none; }
          .neon::before { animation: none; background-position: -120% 0; }
          .type-caret { animation: none; opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
