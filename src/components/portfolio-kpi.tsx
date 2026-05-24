import type { PortfolioKpi as PortfolioKpiData } from '@/data/portfolio';

type Props = {
  kpi: PortfolioKpiData;
};

/**
 * PortfolioKpi
 * ------------
 * A single KPI chip on an /experience project panel. Purely presentational:
 * it shows the KPI's final value as a fixed number — no count-up animation.
 * (The previous animated count-up could freeze mid-count on a fast scroll, so
 * the metric is now simply displayed at its final value.)
 */
export function PortfolioKpi({ kpi }: Props) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-2.5 py-2.5 backdrop-blur-sm sm:px-3 sm:py-3">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(167,139,250,0.18), rgba(244,114,182,0.18))',
        }}
      />
      <div className="relative min-w-0">
        <div
          className="truncate text-base font-semibold tabular-nums tracking-tight sm:text-lg lg:text-xl"
          style={{
            backgroundImage: 'var(--grad-brand-text)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          title={kpi.value}
        >
          {kpi.value}
        </div>
        <div className="mt-1 text-[9px] font-medium uppercase leading-tight tracking-wider text-gray-400 sm:text-[10px]">
          {kpi.label}
        </div>
      </div>
    </div>
  );
}
