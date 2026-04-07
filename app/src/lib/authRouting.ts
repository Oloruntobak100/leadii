import type { User } from '@/types';

/**
 * After sign-in / session restore, send users who have not finished onboarding to the wizard.
 */
export function getPostAuthPage(user: User): 'onboarding' | 'dashboard' {
  if (!user.onboardingCompleted) return 'onboarding';
  return 'dashboard';
}
