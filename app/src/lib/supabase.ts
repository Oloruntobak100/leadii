import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Reject service_role JWTs — they must never ship in the browser. */
function isBrowserSafeSupabaseKey(key: string): boolean {
  try {
    const mid = key.split('.')[1];
    if (!mid) return false;
    const pad = mid.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(
      globalThis.atob(pad.length % 4 ? pad + '='.repeat(4 - (pad.length % 4)) : pad)
    ) as { role?: string };
    return json.role !== 'service_role';
  } catch {
    return true;
  }
}

export const supabaseKeyConfigError =
  anonKey && !isBrowserSafeSupabaseKey(anonKey)
    ? 'Use the anon (public) API key from Supabase → Project Settings → API. Never use the service_role secret in the app or on Vercel for VITE_SUPABASE_ANON_KEY.'
    : null;

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes('your-project') &&
    anonKey.length > 20 &&
    isBrowserSafeSupabaseKey(anonKey)
);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
