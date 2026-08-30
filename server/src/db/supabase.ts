import {
  createClient,
  type RealtimeClientOptions,
  type SupabaseClient,
} from '@supabase/supabase-js';
import WebSocket from 'ws';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  // The service role key bypasses RLS and must never reach the browser. The anon
  // key is accepted as a fallback so the API runs before it is configured.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in server/.env.local'
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // createClient always builds a realtime client, which needs a WebSocket
    // implementation. Node only exposes one globally from v22. The cast bridges
    // ws's constructor signature, which is wider than the interface expects.
    realtime: {
      transport: WebSocket as unknown as RealtimeClientOptions['transport'],
    },
  });

  return client;
}
