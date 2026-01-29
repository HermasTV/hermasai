'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mx-auto px-4 max-w-7xl">
      <div className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Hermas.AI
                </span>
                <div className="text-xs text-gray-400 font-medium">
                  AI Portfolio
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
              >
                Home
              </Link>
              <Link
                href="/projects"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
              >
                Projects
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
              >
                Contact
              </Link>
            </div>

            {/* CTA Button + Mobile Menu Toggle */}
            <div className="flex items-center space-x-3">
              {/* CTA Button */}
              <Link
                href="/projects"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">🚀</span>
                Explore AI
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden inline-flex items-center p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
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
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
            <div className="py-4 space-y-1 border-t border-gray-700/50">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/projects"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🔬 Projects
              </Link>
              <Link
                href="/blog"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                📝 Blog
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                📧 Contact
              </Link>
              <div className="pt-2">
                <Link
                  href="/projects"
                  className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚀 Explore AI Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}