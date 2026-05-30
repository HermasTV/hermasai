'use client';

import { useId } from 'react';

interface HermasLogoProps {
  size?: number;
  animated?: boolean;
  monochrome?: 'dark' | 'light' | null;
  className?: string;
}

export default function HermasLogo({
  size = 40,
  animated = true,
  monochrome = null,
  className = '',
}: HermasLogoProps) {
  // useId is deterministic across SSR + hydration; a module-scoped counter
  // would drift because server and client render trees in different orders.
  const reactId = useId().replace(/[:]/g, '');
  const gradId = `hermas-frame-${reactId}`;
  const traceId = `hermas-trace-${reactId}`;

  const railStroke = monochrome === 'light' ? '#0f172a' : monochrome === 'dark' ? '#ffffff' : `url(#${gradId})`;
  const hubFill = monochrome === 'light' ? '#ffffff' : '#0f172a';
  const hubStroke = monochrome === 'light' ? '#0f172a' : monochrome === 'dark' ? '#ffffff' : '#fb3b53';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      aria-label="Hermas AI"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Static H frame: two parallel rails + bridge */}
      <g stroke={railStroke} strokeLinecap="round" fill="none" opacity={monochrome ? 1 : 0.55}>
        <line x1="26" y1="16" x2="26" y2="76" strokeWidth="7" />
        <line x1="66" y1="16" x2="66" y2="76" strokeWidth="7" />
        <line x1="26" y1="46" x2="66" y2="46" strokeWidth="6" />
      </g>

      {/* Static motor hubs at the four rail-ends */}
      <g fill={hubFill} stroke={hubStroke} strokeWidth="1.2">
        <circle cx="26" cy="16" r="5" />
        <circle cx="66" cy="16" r="5" />
        <circle cx="26" cy="76" r="5" />
        <circle cx="66" cy="76" r="5" />
      </g>

      {/* Single neon trace that walks every edge of the H once, then drains */}
      {animated && !monochrome && (
        <path
          className={traceId}
          d="M 26 16 L 26 76 L 26 46 L 66 46 L 66 16 L 66 76"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 12px #0891b2)',
            strokeDasharray: '220 220',
          }}
        />
      )}

      {/* Motor LED pins */}
      <g fill="#fb3b53">
        <circle cx="26" cy="16" r="1.6" />
        <circle cx="66" cy="16" r="1.6" />
        <circle cx="26" cy="76" r="1.6" />
        <circle cx="66" cy="76" r="1.6" />
      </g>

      {animated && !monochrome && (
        <style>{`
          @keyframes ${traceId}-anim {
            0%   { stroke-dashoffset: 220; }
            45%  { stroke-dashoffset: 0; }
            55%  { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -220; }
          }
          .${traceId} {
            animation: ${traceId}-anim 5s ease-in-out infinite;
          }
        `}</style>
      )}
    </svg>
  );
}
