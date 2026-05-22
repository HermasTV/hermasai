'use client';

import { useEffect, useRef, useState } from 'react';
import TechLogoField from './tech-logo-field';

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

const GRADIENT_TEXT: React.CSSProperties = {
  backgroundImage: 'var(--grad-brand-text)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
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
        {/* Brand wordmark — the single h1 for the page */}
        <h1
          className="hero-fade-1 text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
          style={SERIF_STYLE}
        >
          <span style={GRADIENT_TEXT}>Hermas</span>
          <span className="text-white/90">AI</span>
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
        .hero-fade-1 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .hero-fade-2 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.45s both; }

        /* Typing caret — a slim brand-gradient bar with a soft glow,
           blinking with an eased fade rather than a hard on/off. */
        .type-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 3px;
          vertical-align: -0.16em;
          border-radius: 2px;
          background-image: var(--grad-brand-cta);
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.7);
          animation: caretPulse 1.05s ease-in-out infinite;
        }
        /* once typing is done, the caret settles into a calmer slow blink */
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
          .hero-fade-1, .hero-fade-2 {
            animation: none; opacity: 1; transform: none;
          }
          /* static caret — visible but not blinking */
          .type-caret { animation: none; opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
