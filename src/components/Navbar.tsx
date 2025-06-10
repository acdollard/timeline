import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-row justify-between items-center py-4 w-full px-6">
        <a href="/" className="text-white text-xl font-bold">
          Timeline
        </a>
        <ul className="flex flex-row justify-between items-center text-white gap-4">
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
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
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
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign In
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex flex-row justify-between items-center py-4 px-6">
        <a href="/" className="text-white text-xl font-bold">
          Timeline
        </a>
        <button
          onClick={toggleMenu}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <a href="/" className="text-white text-xl font-bold">
              Timeline
            </a>
            <button
              onClick={toggleMenu}
              className="text-white p-2"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col p-4 space-y-4">
            <li>
              <a
                href="/"
                className="text-white text-lg hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-white text-lg hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                About
              </a>
            </li>
            {session ? (
              <>
                <li>
                  <a
                    href="/summary"
                    className="text-white text-lg hover:text-primary transition-colors"
                    onClick={toggleMenu}
                  >
                    My Timeline
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => {
                      window.location.href = '/api/auth/signout';
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
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
                  className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign In
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 