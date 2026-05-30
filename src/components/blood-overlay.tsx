/**
 * BloodOverlay
 * -----------------------------------------------------------------------------
 * A decorative, STATIC blood overlay scoped to a single card.
 *
 * Built for the "I Am Not a Number" memorial card on /projects. The card reads
 * as a sheet of blood: a deep crimson fill with an organic, mottled texture and
 * a wet sheen. There is NO animation — no flooding, no dripping, no motion.
 *
 * Technique:
 *   - SVG "gooey" filter (Lucas Bebber: feGaussianBlur + feColorMatrix alpha
 *     contrast bump) merges the pool with the irregular bottom-edge bulges so
 *     the lower edge reads as a thick, oozing blood line rather than a straight
 *     rect — texture, not motion.
 *   - Darker translucent blotches + a fractal-noise grain layer give the fill a
 *     non-flat, organic blood texture.
 *
 * Layering:
 *   - <FloodLayer/> lives INSIDE the card's rounded-overflow clip at `-z-10`,
 *     so the blood SITS BEHIND the text/icon/tags (which read on top of it).
 *     The caller MUST add `isolate` to the card root so the negative z-index
 *     stays contained within the card's stacking context.
 *   - The layer is `pointer-events: none` so the card stays clickable, and
 *     `aria-hidden` since the effect is purely decorative.
 * -----------------------------------------------------------------------------
 */

const FILTER_ID = 'blood-goo';
const GRAD_ID = 'blood-grad';
const GLOSS_ID = 'blood-gloss';

/** Fine blood-grain texture (fractal noise, tinted dark) as an inline data-URL
 *  — no asset request. Sits over the red fill at low opacity for organic grit. */
const GRAIN_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")";

/* ============================================================================
 * BloodDefs — shared <defs> for the gooey filter and the blood gradients.
 * ========================================================================== */
function BloodDefs() {
  return (
    <defs>
      {/* Gooey filter — blur + alpha-contrast bump merges the bottom bulges
          into the pool as one continuous liquid edge. */}
      <filter id={FILTER_ID} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 22 -10"
          result="goo"
        />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>

      {/* Deep desaturated crimson — darker toward the bottom for depth */}
      <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8a181d" />
        <stop offset="50%" stopColor="#5a0d11" />
        <stop offset="100%" stopColor="#3a070a" />
      </linearGradient>

      {/* Surface sheen — kept crisp (outside the gooey filter) */}
      <linearGradient id={GLOSS_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/* ============================================================================
 * FloodLayer — full-card static blood fill + texture + sheen. Lives INSIDE the
 * card's clip, sits at -z-10 so the text/icon/tags sit on top of the blood.
 * ========================================================================== */
function FloodLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 select-none"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <BloodDefs />

        {/* Pool: fills the whole card; the bottom-edge bulges merge via the
            gooey filter into a thick, oozing lower edge (static texture). */}
        <g filter={`url(#${FILTER_ID})`} fill={`url(#${GRAD_ID})`}>
          <rect x="-5" y="-2" width="110" height="100" rx="2" />
          <ellipse cx="8" cy="99" rx="3.2" ry="2.4" />
          <ellipse cx="20" cy="99" rx="2.6" ry="2.0" />
          <ellipse cx="32" cy="99" rx="3.4" ry="2.6" />
          <ellipse cx="44" cy="99" rx="2.8" ry="2.1" />
          <ellipse cx="56" cy="99" rx="3.2" ry="2.4" />
          <ellipse cx="68" cy="99" rx="2.6" ry="2.0" />
          <ellipse cx="80" cy="99" rx="3.3" ry="2.5" />
          <ellipse cx="92" cy="99" rx="2.8" ry="2.1" />
        </g>

        {/* Darker mottled stains — organic blood variation (static) */}
        <g fill="#2c0509" opacity="0.45">
          <ellipse cx="22" cy="30" rx="20" ry="13" />
          <ellipse cx="74" cy="22" rx="16" ry="11" />
          <ellipse cx="58" cy="62" rx="24" ry="15" />
          <ellipse cx="16" cy="74" rx="15" ry="12" />
          <ellipse cx="88" cy="70" rx="14" ry="13" />
        </g>

        {/* Wet sheen across the upper portion */}
        <rect x="-5" y="-2" width="110" height="26" fill={`url(#${GLOSS_ID})`} />
      </svg>

      {/* Fine grain layer over the fill — organic blood grit, no motion */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN_BG,
          backgroundRepeat: 'repeat',
          opacity: 0.5,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}

/* ============================================================================
 * Public component — only the static Flood remains (drips removed).
 * ========================================================================== */
const BloodOverlay = {
  Flood: FloodLayer,
};

export default BloodOverlay;
