import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 max-w-4xl mx-auto mt-4 px-4">
      <div 
        className="text-center bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-lg rounded-lg backdrop-blur-sm border border-white/10"
        style={{
          maskImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #ffffff 25%, #ffffff 75%, rgba(255, 255, 255, 0) 100%)',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.6)'
        }}
      >
        <ul className="flex justify-center items-center space-x-0 overflow-x-auto whitespace-nowrap">
          <li className="inline-block">
            <Link 
              href="/" 
              className="block px-5 py-5 text-lg font-medium uppercase text-gray-100/50 hover:text-blue-900/70 hover:bg-white/10 transition-all duration-300 no-underline md:px-4 md:text-base sm:px-3 sm:text-sm"
              style={{
                fontFamily: '"Open Sans", sans-serif'
              }}
            >
              Home
            </Link>
          </li>
          <li className="inline-block">
            <Link 
              href="/projects" 
              className="block px-5 py-5 text-lg font-medium uppercase text-gray-100/50 hover:text-blue-900/70 hover:bg-white/10 transition-all duration-300 no-underline md:px-4 md:text-base sm:px-3 sm:text-sm"
              style={{
                fontFamily: '"Open Sans", sans-serif'
              }}
            >
              Projects
            </Link>
          </li>
          <li className="inline-block">
            <Link 
              href="/" 
              className="block px-5 py-5 text-lg font-medium uppercase text-gray-100/50 hover:text-blue-900/70 hover:bg-white/10 transition-all duration-300 no-underline md:px-4 md:text-base sm:px-3 sm:text-sm"
              style={{
                fontFamily: '"Open Sans", sans-serif'
              }}
            >
              Blog
            </Link>
          </li>
          <li className="inline-block">
            <Link 
              href="/contact" 
              className="block px-5 py-5 text-lg font-medium uppercase text-gray-100/50 hover:text-blue-900/70 hover:bg-white/10 transition-all duration-300 no-underline md:px-4 md:text-base sm:px-3 sm:text-sm"
              style={{
                fontFamily: '"Open Sans", sans-serif'
              }}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}