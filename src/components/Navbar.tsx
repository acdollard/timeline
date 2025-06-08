import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
                onClick={handleSignOut}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <a 
              href="/signin"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar; 