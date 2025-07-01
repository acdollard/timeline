import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';

interface NavbarProps {
  initialSession: Session | null;
}

const Navbar = ({ initialSession }: NavbarProps) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="flex flex-row justify-between items-center py-4 w-full px-6 relative">
      <a href="/" className="text-white text-xl font-bold">
        <img src="/timeline-logo.svg" alt="Timeline Logo" className="h-10"/>
      </a>
      
      {/* Desktop Menu */}
      <ul className="hidden md:flex flex-row justify-between items-center text-white gap-4">
        <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
        <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
        {session ? (
          <>
            <li><a href="/summary" className="hover:text-primary transition-colors">My Timeline</a></li>
            <li>
              <button 
                onClick={() => {
                  window.location.href = '/api/auth/signout';
                }}
                className="bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <button 
              onClick={() => {
                window.location.href = '/signin';
              }}
              className="bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </button>
          </li>
        )}
      </ul>

      {/* Mobile Hamburger Button */}
      <button 
        className="md:hidden text-white p-2"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMenu}>
          <div className="absolute top-0 right-0 h-full w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col p-6 space-y-4">
              <button 
                className="self-end text-white p-2"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <ul className="flex flex-col space-y-4 text-white">
                <li><a href="/" className="hover:text-primary transition-colors py-2" onClick={closeMenu}>Home</a></li>
                <li><a href="/about" className="hover:text-primary transition-colors py-2" onClick={closeMenu}>About</a></li>
                {session ? (
                  <>
                    <li><a href="/summary" className="hover:text-primary transition-colors py-2" onClick={closeMenu}>My Timeline</a></li>
                    <li>
                      <button 
                        onClick={() => {
                          closeMenu();
                          window.location.href = '/api/auth/signout';
                        }}
                        className="bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors w-full text-left"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button 
                      onClick={() => {
                        closeMenu();
                        window.location.href = '/signin';
                      }}
                      className="bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-md transition-colors w-full text-left"
                    >
                      Sign In
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 