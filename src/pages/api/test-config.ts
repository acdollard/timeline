import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Supabase environment configuration is available',
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