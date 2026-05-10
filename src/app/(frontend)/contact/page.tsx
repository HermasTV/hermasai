import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import AnimatedBackground from '@/components/animated-background';
import { PortfolioCaseStudy } from '@/components/portfolio-case-study';
import { PORTFOLIO } from '@/data/portfolio';
import { BreadcrumbJsonLd } from '@/lib/seo/jsonld';

// /contact doubles as the Experience / case-studies page (per Navbar label).
// Title + description are tuned for "Ahmed Hermas experience" and
// "Ahmed Hermas portfolio" / "computer vision engineer" intents.
export const metadata: Metadata = {
  title: 'Experience & Portfolio',
  description:
    'Selected work by Ahmed Hermas — Senior Computer Vision Engineer. Eight years shipping ISO-certified biometrics, city-scale traffic AI, multi-camera tracking, and 3D vehicle reconstruction. Get in touch for senior CV / AI roles.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Experience & Portfolio · Ahmed Hermas',
    description:
      'Senior Computer Vision Engineer — selected case studies and contact details.',
    url: '/contact',
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

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

export default function ExperiencePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Experience', url: '/contact' },
        ]}
      />
      <AnimatedBackground />
      <Navbar />

      <main className="relative flex-grow">
        <Hero />
        <CaseStudies />
        <ContactStrip />
      </main>

      <Footer />

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
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-orb-a { animation: orbDriftA 18s ease-in-out infinite; }
        .hero-orb-b { animation: orbDriftB 22s ease-in-out infinite; }
        .hero-underline { transform-origin: left; animation: underlineGrow 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) 0.4s both; }
        .hero-fade-1 { animation: heroFadeUp 0.9s ease-out 0.1s both; }
        .hero-fade-2 { animation: heroFadeUp 0.9s ease-out 0.25s both; }
        .hero-fade-3 { animation: heroFadeUp 0.9s ease-out 0.45s both; }
        .hero-fade-4 { animation: heroFadeUp 0.9s ease-out 0.65s both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-orb-a, .hero-orb-b { animation: none; }
          .hero-underline { animation: none; transform: scaleX(1); }
          .hero-fade-1, .hero-fade-2, .hero-fade-3, .hero-fade-4 { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="hero-orb-a absolute -left-24 top-10 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 60%)' }}
        />
        <div
          className="hero-orb-b absolute right-0 top-32 h-[520px] w-[520px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 60%)' }}
        />
        <div
          className="absolute left-1/3 top-40 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 60%)' }}
        />
      </div>

      <div className="container relative mx-auto px-4 max-w-6xl pt-12 sm:pt-16 lg:pt-24 pb-14 md:pb-20">
        <div className="hero-fade-1 inline-flex flex-col">
          <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
            Selected Work · 2019–2025
          </span>
          <span
            aria-hidden
            className="hero-underline mt-2 h-[2px] w-32 rounded-full"
            style={{ background: 'var(--grad-brand-cta)' }}
          />
        </div>

        <h1
          className="hero-fade-2 mt-8 text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight"
          style={SERIF_STYLE}
        >
          <span
            style={{
              backgroundImage: 'var(--grad-brand-text)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Ahmed Hermas
          </span>
        </h1>

        <p className="hero-fade-3 mt-4 text-xl md:text-2xl font-medium text-gray-200">
          Computer Vision Engineer
        </p>

        <p className="hero-fade-4 mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-gray-300">
          Eight years building real-world computer-vision systems — from
          ISO-certified biometrics to city-scale traffic AI to 3D vehicle
          reconstruction. Below are the projects I led, hardened, and shipped.
        </p>

        <div className="hero-fade-4 mt-10 flex flex-wrap gap-3 text-xs md:text-sm">
          <Pill>5 case studies</Pill>
          <Pill>4 production systems</Pill>
          <Pill>1 R&D POC</Pill>
        </div>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-gray-300 backdrop-blur-sm">
      {children}
    </span>
  );
}

function CaseStudies() {
  return (
    <div className="container mx-auto px-4 max-w-6xl py-12 md:py-20">
      <div className="space-y-24 md:space-y-36">
        {PORTFOLIO.map((project, i) => (
          <PortfolioCaseStudy key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}

function ContactStrip() {
  return (
    <section
      aria-labelledby="contact-strip-title"
      className="relative mt-12 md:mt-24"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'var(--grad-brand-text)', opacity: 0.6 }}
      />
      <div className="bg-gray-900/60 backdrop-blur-md border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                Get in touch
              </div>
              <h2
                id="contact-strip-title"
                className="mt-3 text-3xl md:text-4xl font-semibold leading-tight tracking-tight"
                style={SERIF_STYLE}
              >
                <span
                  style={{
                    backgroundImage: 'var(--grad-brand-text)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Let&rsquo;s build something
                </span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300">
                Open to senior CV / AI engineering roles, advisory work, and
                interesting collaborations. The fastest way to reach me is
                email.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ul className="space-y-3">
                <ContactRow
                  icon={<MailIcon />}
                  label="Email"
                  value="a7medhermas@gmail.com"
                  href="mailto:a7medhermas@gmail.com"
                />
                <ContactRow
                  icon={<PhoneIcon />}
                  label="Phone"
                  value="+971 52 290 2006"
                  href="tel:+971522902006"
                />
                <ContactRow
                  icon={<PinIcon />}
                  label="Location"
                  value="UAE ✈ EGYPT"
                />
              </ul>

              <div className="mt-8 flex items-center gap-3">
                <SocialLink
                  href="https://github.com/HermasTV"
                  label="GitHub"
                  icon={<GithubIcon />}
                />
                <SocialLink
                  href="https://www.linkedin.com/in/ahmedhermas/"
                  label="LinkedIn"
                  icon={<LinkedinIcon />}
                />
                <SocialLink
                  href="https://www.instagram.com/ahmed_hermas/"
                  label="Instagram"
                  icon={<InstagramIcon />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition-colors duration-300 group-hover:text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          {label}
        </div>
        <div className="text-base font-medium text-gray-100 truncate">
          {value}
        </div>
      </div>
    </div>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'var(--grad-brand-cta)', filter: 'blur(12px)', opacity: 0 }}
      />
      <span className="relative">{icon}</span>
    </a>
  );
}

/* ----------------------------- Icons ----------------------------- */

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 002.882 0z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
      <path d="M301 256c0 24.852-20.148 45-45 45s-45-20.148-45-45 20.148-45 45-45 45 20.148 45 45zm0 0" />
      <path d="M332 120H180c-33.086 0-60 26.914-60 60v152c0 33.086 26.914 60 60 60h152c33.086 0 60-26.914 60-60V180c0-33.086-26.914-60-60-60zm-76 211c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75zm86-146c-8.285 0-15-6.715-15-15s6.715-15 15-15 15 6.715 15 15-6.715 15-15 15zm0 0" />
      <path d="M377 0H135C60.562 0 0 60.563 0 135v242c0 74.438 60.563 135 135 135h242c74.438 0 135-60.563 135-135V135C512 60.562 451.437 0 377 0zm45 332c0 49.625-40.375 90-90 90H180c-49.625 0-90-40.375-90-90V180c0-49.625 40.375-90 90-90h152c49.625 0 90 40.375 90 90zm0 0" />
    </svg>
  );
}
