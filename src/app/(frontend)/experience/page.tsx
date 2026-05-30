import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import StaticBackground from '@/components/static-background';
import { ExperienceScroller } from '@/components/experience-scroller';
import { BreadcrumbJsonLd } from '@/lib/seo/jsonld';

// The Experience / case-studies page. Title + description are tuned for
// "Ahmed Hermas experience" and "Ahmed Hermas portfolio" /
// "computer vision engineer" intents.
export const metadata: Metadata = {
  title: 'Experience & Portfolio',
  description:
    'Selected work by Ahmed Hermas — Senior AI  Engineer. Seven years shipping ISO-certified biometrics, GenAI, city-scale traffic AI, multi-camera tracking, and 3D vehicle reconstruction. Get in touch for senior CV / AI roles.',
  alternates: { canonical: '/experience' },
  openGraph: {
    title: 'Experience & Portfolio · Ahmed Hermas',
    description:
      'Senior AI  Engineer — selected case studies and contact details.',
    url: '/experience',
    type: 'profile',
    firstName: 'Ahmed',
    lastName: 'Hermas',
  },
  keywords: [
    'Ahmed Hermas',
    'Ahmed Hermas portfolio',
    'Ahmed Hermas experience',
    'computer vision engineer portfolio',
    'CV engineer UAE',
    'face recognition engineer',
    'ISO 30107',
    'edge AI engineer',
  ],
};

/**
 * Full-viewport scroll-snap experience.
 *
 * This page is a thin server component: it owns the SEO `metadata`, the
 * `BreadcrumbJsonLd`, the ambient background, and the overlaid navbar. The
 * 7-panel snap sequence (Hero · Project×5 · Contact) lives in the
 * `ExperienceScroller` client component, which is the actual scroll container.
 *
 * The navbar is fixed/overlaid so it floats above the panels without consuming
 * layout height (which would otherwise push panels past 100svh and break the
 * snap rhythm). The site footer is folded into the final Contact panel.
 */
export default function ExperiencePage() {
  return (
    <div className="relative h-[100svh] overflow-hidden">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Experience', url: '/experience' },
        ]}
      />
      <StaticBackground />

      {/* Navbar floats above the panels — does not consume layout height. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <ExperienceScroller />

      <style>{`
        @keyframes orbDriftA {
          0%, 100% { transform: translate3d(-10%, -5%, 0) scale(1); }
          50% { transform: translate3d(8%, 6%, 0) scale(1.1); }
        }
        @keyframes orbDriftB {
          0%, 100% { transform: translate3d(8%, 6%, 0) scale(1.05); }
          50% { transform: translate3d(-6%, -8%, 0) scale(0.95); }
        }
        @keyframes underlineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes scrollBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .hero-orb-a { animation: orbDriftA 18s ease-in-out infinite; }
        .hero-orb-b { animation: orbDriftB 22s ease-in-out infinite; }
        .hero-underline { transform-origin: left; animation: underlineGrow 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) 0.6s both; }
        .experience-scroll-bob { animation: scrollBob 1.8s ease-in-out infinite; }

        /* HUD "vision display" motifs on the active project monitor. */
        @keyframes hudSweep {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(320%); }
        }
        .hud-sweep { animation: hudSweep 3.4s linear infinite; }
        @keyframes hudRec {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .hud-rec { animation: hudRec 1.3s ease-in-out infinite; }

        /* Slim, on-brand scrollbar for the snap container. */
        .experience-snap { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
        .experience-snap::-webkit-scrollbar { width: 6px; }
        .experience-snap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 9999px; }
        .experience-snap::-webkit-scrollbar-track { background: transparent; }

        @media (prefers-reduced-motion: reduce) {
          .hero-orb-a, .hero-orb-b { animation: none; }
          .hero-underline { animation: none; transform: scaleX(1); }
          .experience-scroll-bob { animation: none; }
          .hud-sweep { animation: none; opacity: 0; }
          .hud-rec { animation: none; }
          .experience-snap { scroll-behavior: auto; }
        }
      `}</style>
    </div>
  );
}
