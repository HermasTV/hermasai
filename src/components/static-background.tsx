/**
 * StaticBackground — drop-in replacement for `AnimatedBackground` across the
 * site for pages running real-time pipelines (realtime-face, speech-to-text,
 * unet-segmentation, …).
 *
 * Currently renders only the dark radial gradient the homepage uses as its
 * base layer — a single CSS-only div, zero per-frame cost.
 *
 * Why not the logo field: the full `TechLogoField` is visually rich but
 * carries per-element CSS effects (`backdrop-filter: blur(2px)`,
 * `filter: drop-shadow(...)`, far-layer SVG blur) on ~50 elements. Those are
 * NOT free in "static" mode — the compositor must re-blur every backdrop-
 * filter region whenever the layer behind it changes, and the video on the
 * realtime-face page changes ~30 times a second. Measured: putting the full
 * field on the realtime-face page dropped pipeline FPS to ~10. A "lite"
 * filterless version of the logo field is the planned next step once
 * benchmarked.
 */
export default function StaticBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 38%, #1a1630 0%, #11101c 45%, #0a0a10 100%)",
      }}
    />
  );
}
