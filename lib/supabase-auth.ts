import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// This client only handles sessions. Every read and write to the library goes
// through the API in server/, which holds the service role key.
let client: SupabaseClient | null = null;

export function getSupabaseAuth(): SupabaseClient {
  if (client) {
    return client;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabaseAuth().auth.getSession();

  return data.session?.access_token ?? null;
}
