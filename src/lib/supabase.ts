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

type CookieStore = {
  get(name: string): { value: string } | undefined;
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

export async function getAuthenticatedRequest(
  cookies: CookieStore
): Promise<{ supabaseClient: SupabaseClient; session: Session }> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    throw new AuthenticationError();
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
    throw new AuthenticationError('Invalid session');
  }

  return { supabaseClient, session };
}