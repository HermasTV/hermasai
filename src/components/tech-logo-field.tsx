'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TECH_LOGOS, getSimpleIcon, type TechLogo } from '@/data/tech-logos';

/**
 * TechLogoField
 * -------------
 * The full-bleed, non-interactive background for the HermasAI homepage.
 *
 * It renders ~50 technology logos — the user's stack as a Senior AI /
 * Computer-Vision engineer — as a calm, drifting "constellation" that covers
 * the whole viewport. Replaces the old AmbientScene point-cloud.
 *
 * Design intent:
 *  - UNIFIED MONOCHROME / GLASS: every logo (brand mark + hand-drawn hardware
 *    line-icon) is rendered in ONE brand tint, never real brand colors. This
 *    keeps 30 logos cohesive rather than a multicolor sponsor wall, and
 *    sidesteps brand-color trademark concerns.
 *  - DEPTH VIA PARALLAX: each logo is assigned a depth layer. Far logos are
 *    large, blurred, dim and drift slowly; near logos are small, crisp,
 *    brighter and drift faster. Reads as a field with real depth.
 *  - AMBIENT MOTION ONLY: slow drift + a gentle bob + very slow rotation +
 *    a soft opacity breath. No cursor interaction whatsoever — consistent with
 *    the rest of the homepage.
 *  - TEXT LEGIBILITY IS NON-NEGOTIABLE: a central "quiet zone" repels logos
 *    away from the middle of the viewport where the headline sits, and a
 *    radial scrim (in HomeHero) sits over the field. Logos are a background.
 *
 * Implementation:
 *  - DOM elements: one absolutely-positioned <svg> per logo, animated via CSS
 *    transforms in a single requestAnimationFrame loop. DOM keeps the SVG
 *    crisp at any size and 50 nodes is trivially cheap.
 *  - Layout is computed once (deterministic-ish jittered grid + central
 *    repulsion) and recomputed on significant resize / breakpoint change.
 *  - The rAF loop pauses while the tab is hidden.
 *  - prefers-reduced-motion: renders the exact same arrangement, fully STATIC
 *    (no rAF loop) — still a pleasant frosted constellation, just not moving.
 *  - Decorative: aria-hidden + pointer-events:none on the root.
 */

/* Brand tint — the homepage triad. The whole field is drawn in these three
   hues only; which hue a given logo gets is fixed per logo at layout time. */
const TINTS = ['#60a5fa', '#a78bfa', '#f472b6'] as const;

/** Per-depth-layer visual + motion tuning. 0 = far, 2 = near. */
const LAYERS = [
  // far: large, soft-blurred, dim, slow, barely rotates
  { scale: 1.55, blur: 2.6, opacity: 0.16, drift: 0.42, rotate: 0.5 },
  // mid
  { scale: 1.05, blur: 0.9, opacity: 0.3, drift: 0.72, rotate: 0.85 },
  // near: small, crisp, brighter, quicker
  { scale: 0.74, blur: 0, opacity: 0.46, drift: 1.0, rotate: 1.25 },
] as const;

/** One positioned, animated logo instance. */
interface Placed {
  logo: TechLogo;
  /** depth layer index into LAYERS */
  layer: 0 | 1 | 2;
  /** base position as viewport fraction, 0..1 */
  bx: number;
  by: number;
  /** icon footprint in px (before layer scale) */
  size: number;
  tint: string;
  /** motion phases / rates — each logo moves a little differently */
  driftPhase: number;
  driftRate: number;
  driftAmpX: number;
  driftAmpY: number;
  bobPhase: number;
  bobRate: number;
  rotDir: 1 | -1;
  breathPhase: number;
}

/** Responsive field config. Every logo in TECH_LOGOS is always placed (see
 *  buildField), so the full curated set is visible on every screen — only the
 *  logo size and the central quiet-zone radius vary by breakpoint. */
function fieldConfigFor(w: number) {
  if (w < 640) return { baseSize: 28, quietR: 0.33 };
  if (w < 1024) return { baseSize: 44, quietR: 0.29 };
  if (w < 1920) return { baseSize: 60, quietR: 0.26 };
  return { baseSize: 72, quietR: 0.23 };
}

/* A small seeded PRNG so a given viewport size yields a stable, pleasing
   arrangement (no reshuffle on every minor resize / re-render). */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Build the placed-logo arrangement for a given viewport.
 *
 * Strategy: a jittered grid spreads logos across the whole viewport so the
 * field feels even (no clumps, no bald patches), then any logo that lands in
 * the central "quiet zone" is pushed radially outward so the headline stays
 * clear. Far-layer logos are placed first / weighted toward the edges.
 */
function buildField(w: number, h: number): Placed[] {
  const { baseSize, quietR } = fieldConfigFor(w);
  // Place every logo exactly once — the whole curated set is always visible.
  const count = TECH_LOGOS.length;
  const rng = makeRng(Math.round(w / 40) * 1000 + Math.round(h / 40));
  const aspect = w / Math.max(h, 1);

  // jittered grid — cols/rows chosen to roughly match the viewport aspect
  const cols = Math.max(3, Math.round(Math.sqrt(count * aspect)));
  const rows = Math.ceil(count / cols);

  const placed: Placed[] = [];
  for (let i = 0; i < count; i++) {
    const logo = TECH_LOGOS[i % TECH_LOGOS.length];
    const col = i % cols;
    const row = Math.floor(i / cols);

    // cell center + jitter, kept off the very edges
    let bx = (col + 0.5) / cols + (rng() - 0.5) * (0.9 / cols);
    let by = (row + 0.5) / rows + (rng() - 0.5) * (0.9 / rows);
    bx = Math.min(0.95, Math.max(0.05, bx));
    by = Math.min(0.94, Math.max(0.06, by));

    // central quiet zone — push logos out so they don't sit behind the text.
    // distance measured in an aspect-corrected space so the zone is a circle.
    const dx = (bx - 0.5) * aspect;
    const dy = by - 0.5;
    const dist = Math.hypot(dx, dy);
    if (dist < quietR) {
      const push = quietR / Math.max(dist, 0.04);
      bx = 0.5 + (bx - 0.5) * push;
      by = 0.5 + (by - 0.5) * push;
      bx = Math.min(0.96, Math.max(0.04, bx));
      by = Math.min(0.95, Math.max(0.05, by));
    }

    // depth: bias near-center logos toward the far/dim layers so anything
    // close to the text is the least visually loud; edges get more near layers
    const edgeness = Math.min(1, Math.hypot((bx - 0.5) * aspect, by - 0.5) / 0.6);
    const roll = rng() * 0.65 + edgeness * 0.35;
    const layer: 0 | 1 | 2 = roll < 0.42 ? 0 : roll < 0.74 ? 1 : 2;

    placed.push({
      logo,
      layer,
      bx,
      by,
      size: baseSize * (0.82 + rng() * 0.5),
      tint: TINTS[i % TINTS.length],
      driftPhase: rng() * Math.PI * 2,
      driftRate: 0.05 + rng() * 0.07,
      driftAmpX: 14 + rng() * 26,
      driftAmpY: 12 + rng() * 22,
      bobPhase: rng() * Math.PI * 2,
      bobRate: 0.18 + rng() * 0.22,
      rotDir: rng() < 0.5 ? 1 : -1,
      breathPhase: rng() * Math.PI * 2,
    });
  }

  // draw far layers first so crisp near logos stack on top
  placed.sort((a, b) => a.layer - b.layer);
  return placed;
}

/** Render the inner SVG markup for one logo (brand path or line-icon body). */
function logoInnerSvg(logo: TechLogo): { body: string; title: string } | null {
  if (logo.kind === 'line') {
    return { body: logo.body, title: logo.label };
  }
  const icon = getSimpleIcon(logo.iconKey);
  if (!icon) return null; // simple-icons dropped this slug — skip gracefully
  return {
    body: `<path d="${icon.path}" fill="currentColor"/>`,
    title: logo.label,
  };
}

export default function TechLogoField({
  animate = true,
  lite = false,
}: { animate?: boolean; lite?: boolean } = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  // refs to each logo wrapper so the rAF loop can write transforms directly
  // (no React re-render per frame).
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [field, setField] = useState<Placed[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  // ---- (re)build the arrangement on mount + significant resize ----
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onMq);

    let lastW = 0;
    let lastH = 0;
    const rebuild = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // only rebuild on a meaningful change — avoids reshuffles from mobile
      // browser-chrome show/hide nudging the viewport height by a few px
      if (Math.abs(w - lastW) < 48 && Math.abs(h - lastH) < 80) return;
      lastW = w;
      lastH = h;
      setField(buildField(w, h));
    };
    rebuild();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 160);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  // ---- animation loop — transforms written straight to the DOM ----
  useEffect(() => {
    // animate=false lets a caller force the static "resting pose" render
    // (same arrangement as prefers-reduced-motion) for pages that can't
    // spare main-thread time for an ambient rAF — e.g. realtime-face.
    if (!animate || reduceMotion || field.length === 0) return;

    let rafId = 0;
    let startTs = 0;
    let lastFrame = 0;
    const FRAME_MS = 1000 / 40; // 40fps cap — smooth, gentle on battery

    const step = (now: number) => {
      rafId = requestAnimationFrame(step);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      if (!startTs) startTs = now;
      const t = (now - startTs) * 0.001;

      for (let i = 0; i < field.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const p = field[i];
        const L = LAYERS[p.layer];

        // gentle elliptical drift + a slower vertical bob, scaled by depth
        const driftX =
          Math.sin(t * p.driftRate * Math.PI * 2 + p.driftPhase) *
          p.driftAmpX *
          L.drift;
        const driftY =
          Math.cos(t * p.driftRate * Math.PI * 2 * 0.8 + p.driftPhase) *
          p.driftAmpY *
          L.drift;
        const bob =
          Math.sin(t * p.bobRate * Math.PI * 2 + p.bobPhase) * 6 * L.drift;

        // very slow rotation — a few degrees of sway, not a spin
        const rot =
          Math.sin(t * 0.06 * Math.PI * 2 + p.driftPhase) *
          7 *
          L.rotate *
          p.rotDir;

        // soft opacity breath around the layer's base opacity
        const breath = 0.82 + 0.18 * Math.sin(t * 0.22 * Math.PI * 2 + p.breathPhase);

        el.style.transform = `translate3d(${driftX}px, ${
          driftY + bob
        }px, 0) rotate(${rot}deg) scale(${L.scale})`;
        el.style.opacity = String(L.opacity * breath);
      }
    };
    rafId = requestAnimationFrame(step);

    // pause while the tab is hidden — no battery drain, no catch-up burst
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (rafId === 0) {
        lastFrame = 0;
        rafId = requestAnimationFrame(step);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [animate, field, reduceMotion]);

  // memoize the rendered svg markup so it isn't recomputed each render
  const items = useMemo(
    () =>
      field.map((p) => ({ placed: p, svg: logoInnerSvg(p.logo) })),
    [field]
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map(({ placed, svg }, i) => {
        if (!svg) return null;
        const L = LAYERS[placed.layer];
        // Resting pose: layer scale baked into the initial transform. Under
        // reduced motion this is the final, static look; otherwise the rAF
        // loop takes over from this exact pose so there's no first-frame jump.
        const initialTransform = `translate3d(0,0,0) scale(${L.scale})`;
        return (
          <div
            key={`${placed.logo.label}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="absolute will-change-transform"
            style={{
              left: `${placed.bx * 100}%`,
              top: `${placed.by * 100}%`,
              width: placed.size,
              height: placed.size,
              // center the icon on its (left,top) anchor
              marginLeft: -placed.size / 2,
              marginTop: -placed.size / 2,
              opacity: L.opacity,
              transform: initialTransform,
              // `lite` mode drops the layer blur — the backdrop-filter on the
              // chip and the SVG drop-shadow are the heavy compositor work
              // (re-blurred per-frame when the layer behind moves), so they
              // are conditional below.
              filter: lite ? undefined : L.blur > 0 ? `blur(${L.blur}px)` : undefined,
            }}
          >
            {/* frosted-glass chip behind the mark — subtle premium depth.
                Omitted in `lite` mode: the backdrop-filter forces the
                compositor to re-blur this region every time the content
                behind it (e.g. a playing webcam) repaints. */}
            {!lite && (
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: `0 0 18px ${placed.tint}14`,
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                }}
              />
            )}
            {/* the logo itself — tinted via currentColor. `lite` mode drops
                the drop-shadow filter (another per-frame compositor cost). */}
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 h-full w-full p-[22%]"
              style={{
                color: placed.tint,
                filter: lite ? undefined : `drop-shadow(0 0 5px ${placed.tint}55)`,
              }}
              role="img"
              aria-label={svg.title}
              dangerouslySetInnerHTML={{ __html: svg.body }}
            />
          </div>
        );
      })}
    </div>
  );
}
