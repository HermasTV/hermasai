interface HermasWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  monochrome?: 'dark' | 'light' | null;
  className?: string;
}

const SIZES = {
  sm: { name: 16, pill: 9, gap: 6, padX: 5, padY: 2, radius: 4 },
  md: { name: 22, pill: 10, gap: 8, padX: 6, padY: 2, radius: 5 },
  lg: { name: 30, pill: 11, gap: 8, padX: 7, padY: 3, radius: 5 },
};

export default function HermasWordmark({
  size = 'md',
  monochrome = null,
  className = '',
}: HermasWordmarkProps) {
  const s = SIZES[size];

  const nameStyle: React.CSSProperties =
    monochrome === 'light'
      ? { color: '#0f172a' }
      : monochrome === 'dark'
        ? { color: '#ffffff' }
        : {
            background: 'linear-gradient(90deg,#67e8f9 0%,#22d3ee 55%,#0e7490 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          };

  const pillStyle: React.CSSProperties =
    monochrome === 'light'
      ? { background: '#0f172a', color: '#ffffff' }
      : monochrome === 'dark'
        ? { background: '#ffffff', color: '#0f172a' }
        : { background: 'linear-gradient(90deg,#fb3b53,#e11d48)', color: '#ffffff' };

  return (
    <span
      className={className}
      style={{
        fontSize: s.name,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        lineHeight: 1,
        ...nameStyle,
      }}
    >
      Hermas
      <span
        style={{
          fontSize: s.pill,
          fontWeight: 700,
          letterSpacing: '0.18em',
          padding: `${s.padY}px ${s.padX}px`,
          borderRadius: s.radius,
          transform: 'translateY(-1px)',
          ...pillStyle,
        }}
      >
        AI
      </span>
    </span>
  );
}
