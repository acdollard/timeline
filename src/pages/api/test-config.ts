import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error.message,
        details: error.details,
        hint: error.hint
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Raw data from Supabase:', data);

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Successfully connected to Supabase',
      data: data,
      config: {
        url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 