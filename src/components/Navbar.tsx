import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface NavbarProps {
  initialSession: Session | null;
}

const Navbar = ({ initialSession }: NavbarProps) => {
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  return (
    <nav className="flex flex-row justify-between items-center py-4 w-full px-6">
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
    </nav>
  );
};

export default Navbar; 