'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import HermasLogo from './hermas-logo';
import HermasWordmark from './hermas-wordmark';

const NAV_LINKS = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/projects', label: 'Projects', emoji: '🔬' },
  { href: '/blog', label: 'Blog', emoji: '📝' },
  { href: '/contact', label: 'Experience', emoji: '💼' },
] as const;

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="mx-auto pt-4 px-4 max-w-7xl">
      <div className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="relative w-10 h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <HermasLogo size={40} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:block min-w-0">
                <HermasWordmark size="md" />
                <div className="text-xs text-gray-400 font-medium mt-1 truncate">
                  AI Portfolio
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                      active
                        ? 'text-white bg-white/10 shadow-inner'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 flex-shrink-0 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
            <div className="py-4 space-y-1 border-t border-gray-700/50">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                      active
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-2">{link.emoji}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
