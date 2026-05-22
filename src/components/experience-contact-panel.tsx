'use client';

import { forwardRef } from 'react';

/**
 * Final panel of the /experience snap experience — Get in touch.
 *
 * Re-fits the former ContactStrip into one `100svh` snap panel and folds the
 * site footer line into the bottom so it does not become a stray mini-panel
 * that breaks the snap rhythm.
 */

const SERIF_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
};

const GRADIENT_TEXT: React.CSSProperties = {
  backgroundImage: 'var(--grad-brand-text)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

type Props = {
  panelIndex: number;
  isActive: boolean;
  reducedMotion: boolean;
};

export const ExperienceContactPanel = forwardRef<HTMLElement, Props>(
  function ExperienceContactPanel({ panelIndex, isActive, reducedMotion }, ref) {
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
        aria-labelledby="experience-contact-title"
        className="relative flex h-[100svh] w-full snap-start flex-col items-center justify-center overflow-hidden px-5 py-16 sm:px-8"
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-[18%] h-[55vmin] w-[55vmin] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #a78bfa 0%, transparent 65%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
          {/* Heading block */}
          <div
            className={`flex flex-col items-center text-center ${base} ${
              revealed ? on : off
            }`}
            style={reveal(0)}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:text-xs">
              Get in touch
            </span>
            <h2
              id="experience-contact-title"
              className="mt-3 text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-tight"
              style={SERIF_STYLE}
            >
              <span style={GRADIENT_TEXT}>Let&rsquo;s build something</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
              Open to senior CV / AI Forward Engineering roles, advisory work,
              and interesting collaborations. The fastest way to reach me is
              email.
            </p>
          </div>

          {/* Contact rows */}
          <ul
            className={`mt-8 grid w-full max-w-3xl gap-3 sm:mt-10 sm:grid-cols-3 ${base} ${
              revealed ? on : off
            }`}
            style={reveal(120)}
          >
            <ContactCard
              icon={<MailIcon />}
              label="Email"
              value="a7medhermas@gmail.com"
              href="mailto:a7medhermas@gmail.com"
            />
            <ContactCard
              icon={<PhoneIcon />}
              label="Phone"
              value="+971 52 290 2006"
              subValue="+20 1112 44 0020"
            />
            <ContactCard
              icon={<PinIcon />}
              label="Location"
              value="UAE ✈ Egypt"
            />
          </ul>

          {/* Social links */}
          <div
            className={`mt-7 flex items-center justify-center gap-3 sm:mt-8 ${base} ${
              revealed ? on : off
            }`}
            style={reveal(220)}
          >
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

        {/* Folded-in footer line */}
        <div
          className={`relative mt-6 w-full max-w-5xl border-t border-white/5 pt-5 text-center ${base} ${
            revealed ? on : off
          }`}
          style={reveal(320)}
        >
          <p className="text-xs text-gray-500">
            © 2026 Hermas AI — Built with Next.js, TailwindCSS &amp; vibe
            coding.
          </p>
        </div>
      </section>
    );
  },
);

/* ----------------------------- Pieces ----------------------------- */

function ContactCard({
  icon,
  label,
  value,
  subValue,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  href?: string;
}) {
  const inner = (
    <div className="group flex h-full items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition-colors duration-300 group-hover:text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-gray-100">
          {value}
        </div>
        {subValue ? (
          <div className="truncate text-xs text-gray-400">{subValue}</div>
        ) : null}
      </div>
    </div>
  );
  return (
    <li>
      {href ? (
        <a
          href={href}
          className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          {inner}
        </a>
      ) : (
        inner
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
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: 'var(--grad-brand-cta)' }}
      />
      <span className="relative">{icon}</span>
    </a>
  );
}

/* ----------------------------- Icons ----------------------------- */

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
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
