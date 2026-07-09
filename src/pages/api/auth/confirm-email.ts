import type { APIRoute } from 'astro';
import { createRequestSupabaseClient, setAuthSessionCookies } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { access_token: accessToken, refresh_token: refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'Missing session tokens' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Invalid session tokens' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    setAuthSessionCookies(cookies, session);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Unexpected email confirmation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return new Response(JSON.stringify({ error: 'Failed to confirm email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
