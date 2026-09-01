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
  // The service role key bypasses RLS and must never reach the browser. Rows are
  // scoped to req.userId in the media service instead. The anon key is not a
  // valid fallback: RLS keys off auth.uid(), which is null for an anon request.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.local'
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
