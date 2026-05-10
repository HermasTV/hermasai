'use client';

import { useState } from 'react';

interface FlipCardProps {
  icon: string;
  title: string;
  subtitle: string;
  details: string;
  gradient: string;
  iconBg: string;
}

export default function FlipCard({ icon, title, subtitle, details, gradient, iconBg }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-52 sm:h-56 w-full [perspective:1000px] cursor-pointer select-none"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        className={`relative h-full w-full rounded-2xl shadow-2xl transition-all duration-700 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-5 [backface-visibility:hidden]">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
            {icon}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-0.5">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-auto">
            <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></span>
            hover to explore
            <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></span>
          </div>
        </div>

        {/* Back Face */}
        <div className={`absolute inset-0 h-full w-full rounded-2xl ${gradient} border border-white/10 flex flex-col items-center justify-center gap-2 p-5 [transform:rotateY(180deg)] [backface-visibility:hidden]`}>
          <div className="text-2xl">{icon}</div>
          <h3 className="text-base font-bold text-white text-center">{title}</h3>
          <p className="text-xs text-white/85 text-center leading-relaxed">{details}</p>
        </div>
      </div>
    </div>
  );
}
