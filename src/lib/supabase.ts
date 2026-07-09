import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables not found:', {
    url: supabaseUrl,
    keyExists: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AUTH_COOKIE_OPTIONS = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
};

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

type MutableCookieStore = CookieStore & {
  set(name: string, value: string, options: typeof AUTH_COOKIE_OPTIONS): void;
  delete(name: string, options: { path: string }): void;
};

export class AuthenticationError extends Error {
  constructor(message = 'No authenticated user') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function createRequestSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function setAuthSessionCookies(cookies: MutableCookieStore, session: Session): void {
  cookies.set('sb-access-token', session.access_token, AUTH_COOKIE_OPTIONS);
  cookies.set('sb-refresh-token', session.refresh_token, AUTH_COOKIE_OPTIONS);
}

export function clearAuthSessionCookies(cookies: MutableCookieStore): void {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}

export async function getSessionFromCookies(
  cookies: MutableCookieStore
): Promise<{ supabaseClient: SupabaseClient; session: Session } | null> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return null;
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
    return null;
  }

  setAuthSessionCookies(cookies, session);

  return { supabaseClient, session };
}

export async function getAuthenticatedRequest(
  cookies: MutableCookieStore
): Promise<{ supabaseClient: SupabaseClient; session: Session }> {
  const auth = await getSessionFromCookies(cookies);

  if (!auth) {
    throw new AuthenticationError('Invalid session');
  }

  return auth;
}