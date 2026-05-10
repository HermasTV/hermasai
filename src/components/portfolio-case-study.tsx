'use client';

import Image from 'next/image';
import type { PortfolioMedia, PortfolioProject } from '@/data/portfolio';
import { useInView } from '@/hooks/useInView';
import { PortfolioKpi } from './portfolio-kpi';

type Props = {
  project: PortfolioProject;
  index: number;
};

export function PortfolioCaseStudy({ project, index }: Props) {
  const isReversed = index % 2 === 1;
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.12 });

  const revealBase =
    'transition-all duration-700 ease-out will-change-transform';
  const revealOff = 'opacity-0 translate-y-6';
  const revealOn = 'opacity-100 translate-y-0';

  return (
    <section
      ref={ref}
      className="relative scroll-mt-24"
      aria-labelledby={`project-${project.slug}-title`}
    >
      <div
        className={`grid gap-8 lg:gap-14 lg:grid-cols-12 items-center ${
          isReversed ? 'lg:[&>:first-child]:order-2' : ''
        }`}
      >
        {/* Media side */}
        <div className={`lg:col-span-6 ${revealBase} ${inView ? revealOn : revealOff}`}>
          <MediaFrame media={project.media} />
        </div>

        {/* Copy side */}
        <div className="lg:col-span-6">
          <div
            className={`${revealBase} ${inView ? revealOn : revealOff}`}
            style={{ transitionDelay: '80ms' }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {project.eyebrow}
            </div>
          </div>

          <h2
            id={`project-${project.slug}-title`}
            className={`mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-tight ${revealBase} ${
              inView ? revealOn : revealOff
            }`}
            style={{
              fontFamily: 'var(--font-fraunces), ui-serif, Georgia, serif',
              transitionDelay: '160ms',
            }}
          >
            <span
              style={{
                backgroundImage: 'var(--grad-brand-text)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {project.title}
            </span>
          </h2>

          <p
            className={`mt-4 text-sm font-medium uppercase tracking-wider text-gray-300 ${revealBase} ${
              inView ? revealOn : revealOff
            }`}
            style={{ transitionDelay: '240ms' }}
          >
            {project.role}
          </p>

          <p
            className={`mt-5 text-base md:text-lg leading-relaxed text-gray-300 ${revealBase} ${
              inView ? revealOn : revealOff
            }`}
            style={{ transitionDelay: '320ms' }}
          >
            {project.paragraph}
          </p>

          {/* KPI grid */}
          <div
            className={`mt-7 grid gap-3 ${
              project.kpis.length === 4
                ? 'grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {project.kpis.map((kpi, i) => (
              <PortfolioKpi key={kpi.label} kpi={kpi} delayMs={400 + i * 80} />
            ))}
          </div>

          {/* Highlights */}
          <ul className="mt-7 space-y-2.5">
            {project.highlights.map((h, i) => (
              <li
                key={h}
                className={`flex gap-3 text-sm md:text-base text-gray-300 ${revealBase} ${
                  inView ? revealOn : revealOff
                }`}
                style={{ transitionDelay: `${700 + i * 70}ms` }}
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: 'var(--grad-brand-cta)' }}
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* Tags */}
          <div
            className={`mt-7 flex flex-wrap gap-2 ${revealBase} ${
              inView ? revealOn : revealOff
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MediaFrame({ media }: { media: PortfolioMedia }) {
  return (
    <div className="group relative">
      {/* Brand-gradient glow */}
      <div
        aria-hidden
        className="absolute -inset-1 rounded-3xl opacity-40 blur-2xl transition-opacity duration-700 group-hover:opacity-80"
        style={{ background: 'var(--grad-brand-text)' }}
      />
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 shadow-2xl">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <MediaInner media={media} />
        </div>
        {/* Subtle inner ring */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
      </div>
    </div>
  );
}

function MediaInner({ media }: { media: PortfolioMedia }) {
  if (media.kind === 'video') {
    return (
      <video
        className="h-full w-full object-cover"
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label={media.alt}
      />
    );
  }
  if (media.kind === 'gif') {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media.src}
        alt={media.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-cover"
    />
  );
}
