import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'disabled',
    message: 'Seed data endpoint is disabled'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}; 