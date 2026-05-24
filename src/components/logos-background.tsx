/**
 * LogosBackground — visual "fixed logos" background for non-realtime pages.
 *
 * Renders the same dark radial gradient the homepage uses + a fully static
 * `TechLogoField` (same logos, motion turned off). Used on pages that do not
 * have a continuously-repainting layer behind the logos: experience, projects
 * index, ai-meeting-summary, resume-matcher, speech-to-text, unet-segmentation.
 *
 * **Do NOT use on realtime-face.** Measured: 50 absolutely-positioned logo
 * elements each become a separate GPU layer, and the compositor redoes layer
 * work every time content behind them repaints. The realtime-face page has a
 * playing webcam updating ~30×/sec, which forced a 34% pipeline-FPS regression
 * even with all per-element filters stripped. realtime-face uses the cheaper
 * `StaticBackground` (gradient only) instead.
 */
import TechLogoField from "@/components/tech-logo-field";

export default function LogosBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 38%, #1a1630 0%, #11101c 45%, #0a0a10 100%)",
        }}
      />
      <TechLogoField animate={false} />
    </div>
  );
}
