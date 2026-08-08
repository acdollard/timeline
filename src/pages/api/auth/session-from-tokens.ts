import type { APIRoute } from 'astro';
import { createRequestSupabaseClient } from '../../../lib/supabase';

const COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Establish an httpOnly cookie session from email-link tokens.
 * Tokens must be sent in the POST body — never as URL query params.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const accessToken = typeof body?.access_token === 'string' ? body.access_token : '';
    const refreshToken = typeof body?.refresh_token === 'string' ? body.refresh_token : '';

    if (!accessToken || !refreshToken) {
      return jsonResponse({ error: 'Missing access_token or refresh_token' }, 400);
    }

    const supabaseClient = createRequestSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !session) {
      return jsonResponse({ error: 'Invalid or expired session tokens' }, 401);
    }

    cookies.set('sb-access-token', session.access_token, COOKIE_OPTIONS);
    cookies.set('sb-refresh-token', session.refresh_token, COOKIE_OPTIONS);

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error('session-from-tokens error:', error);
    return jsonResponse({ error: 'Failed to establish session' }, 500);
  }
};
