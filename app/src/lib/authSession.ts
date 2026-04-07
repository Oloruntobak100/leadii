import type { Session } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type SubscriptionTier = AppUser['subscription'];

function mapSubscriptionTier(tier: string | null | undefined): SubscriptionTier {
  const t = (tier || 'free').toLowerCase();
  if (t === 'starter') return 'starter';
  if (t === 'professional' || t === 'pro') return 'professional';
  if (t === 'enterprise') return 'enterprise';
  return 'free';
}

/**
 * Load profile + credit balance after Supabase Auth session exists.
 */
export async function loadAppUserFromSession(
  supabase: SupabaseClient,
  session: Session
): Promise<AppUser> {
  const userId = session.user.id;
  const email = session.user.email ?? '';

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      `
      full_name,
      subscription_tier,
      onboarding_completed,
      onboarding_industry,
      default_outreach_channel,
      credit_balances ( balance )
    `
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  const cb = profile?.credit_balances as
    | { balance: number }
    | { balance: number }[]
    | null
    | undefined;
  const balanceRow = Array.isArray(cb) ? cb[0] : cb;
  const credits = Math.round(Number(balanceRow?.balance ?? 0));

  return {
    id: userId,
    email,
    name: profile?.full_name?.trim() || email.split('@')[0] || 'User',
    credits,
    subscription: mapSubscriptionTier(profile?.subscription_tier),
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    onboardingIndustry:
      (profile?.onboarding_industry as string | null | undefined) ?? null,
    defaultOutreachChannel:
      (profile?.default_outreach_channel as string | null | undefined) ?? null,
  };
}
