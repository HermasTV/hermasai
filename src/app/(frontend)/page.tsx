import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import HomeHero from "@/components/home-hero";

// Homepage owns the personal-brand search. Title is intentionally short so
// the brand string stays visible even after Google appends "| Ahmed Hermas"
// on internal pages. Description hits the highest-volume long-tail variants
// people use when looking for Ahmed by name.
export const metadata: Metadata = {
  title: "Ahmed Hermas — AI & Computer Vision Engineer",
  description:
    "Ahmed Hermas is a Senior AI / Computer Vision Engineer building production ML systems and browser-based WebGPU demos. Explore live AI projects, computer-vision case studies, and writing on edge AI.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: "Ahmed Hermas — AI & Computer Vision Engineer",
    description:
      "Senior AI / Computer Vision Engineer. 8+ years shipping ISO-certified biometrics, city-scale traffic AI, and browser-based WebGPU demos.",
    url: "/",
    firstName: "Ahmed",
    lastName: "Hermas",
  },
};

/**
 * Homepage — a single, non-scrollable, ambient visual landing.
 *
 * The page is exactly one viewport tall (100svh, using svh so mobile
 * browser chrome can't introduce scroll or jump) with overflow hidden.
 * It renders ONLY three things:
 *   - a static dark-gradient base layer (the TechLogoField draws on top of
 *     it; the homepage owns the tech-logo field directly via HomeHero rather
 *     than going through the site-wide StaticBackground wrapper),
 *   - the Navbar (so Projects / Experience / Blog stay reachable),
 *   - the full-viewport HomeHero (the tech-logo field + minimal centered
 *     text).
 *
 * There is no Footer and no scrolling — every other page keeps both.
 */
export default function Home() {
  return (
    <div className="relative flex h-[100svh] flex-col overflow-hidden">
      {/* Static dark-gradient base. The animated canvas lives inside
          HomeHero and renders over this; this layer just guarantees a
          dark, on-brand backdrop and prevents any flash of white. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 38%, #1a1630 0%, #11101c 45%, #0a0a10 100%)",
        }}
      />

      <Navbar />

      <main className="relative flex min-h-0 flex-1 flex-col">
        <HomeHero />
      </main>
    </div>
  );
}
