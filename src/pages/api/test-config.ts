import type { APIRoute } from 'astro';
import { createRequestSupabaseClient } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Test Supabase connection
    const supabaseClient = createRequestSupabaseClient();
    const { error } = await supabaseClient
      .from('events')
      .select('id', { count: 'exact', head: true });

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

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Successfully connected to Supabase',
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