import type { SupabaseClient } from '@supabase/supabase-js';

export async function authUserExistsByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ exists: boolean; errorMessage?: string }> {
  const { data, error } = await supabase.rpc('auth_user_exists_by_email', {
    p_email: email.trim(),
  });

  if (error) return { exists: false, errorMessage: error.message };
  return { exists: Boolean(data) };
}

/** Supabase / GoTrue duplicate signup messages vary slightly by version. */
export function isEmailAlreadyRegisteredError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already exists') ||
    m.includes('email address is already')
  );
}
