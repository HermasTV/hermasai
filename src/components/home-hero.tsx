'use client';

import Link from 'next/link';
import { TypeAnimation } from 'react-type-animation';

export default function HomeHero() {
  return (
    <section className="text-center py-20">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in flex items-center justify-center gap-4 flex-wrap">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Hermas
        </span>
        <span
          className="text-white px-4 py-1 rounded-xl"
          style={{
            background: 'linear-gradient(90deg,#60a5fa,#a78bfa)',
            color: '#0a0f1f',
            fontSize: '0.55em',
            letterSpacing: '0.18em',
            fontWeight: 800,
            transform: 'translateY(-0.18em)',
          }}
        >
          AI
        </span>
      </h1>

      <div className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto min-h-[2rem]">
        <TypeAnimation
          sequence={[
            400,
            'Welcome to my Virtual Garage for AI experiments.',
          ]}
          speed={{ type: 'keyStrokeDelayInMs', value: 32 }}
          cursor={true}
          repeat={0}
          wrapper="span"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/projects"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View Projects
        </Link>
        <Link
          href="/contact"
          className="border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:border-blue-400"
        >
          Get in Touch
        </Link>
      </div>
    </section>
  );
}
