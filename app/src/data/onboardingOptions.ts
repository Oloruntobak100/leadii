import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Code,
  GraduationCap,
  Home,
  Linkedin,
  Mail,
  MessageSquare,
  Scale,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';

export interface IndustryOption {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface ChannelOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

export const ONBOARDING_INDUSTRIES: IndustryOption[] = [
  { id: 'realestate', name: 'Real Estate', icon: Home },
  { id: 'saas', name: 'SaaS / Technology', icon: Code },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
  { id: 'finance', name: 'Finance / Banking', icon: TrendingUp },
  { id: 'consulting', name: 'Consulting', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'legal', name: 'Legal Services', icon: Scale },
];

export const ONBOARDING_CHANNELS: ChannelOption[] = [
  { id: 'email', name: 'Email', icon: Mail, description: 'Professional & scalable' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'B2B focused' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, description: 'High engagement' },
  { id: 'sms', name: 'SMS', icon: Smartphone, description: 'Immediate reach' },
];

export function industryLabel(id: string | null | undefined): string {
  if (!id) return '—';
  return ONBOARDING_INDUSTRIES.find((i) => i.id === id)?.name ?? id;
}

export function channelLabel(id: string | null | undefined): string {
  if (!id) return '—';
  return ONBOARDING_CHANNELS.find((c) => c.id === id)?.name ?? id;
}

/** Maps onboarding industry slug → campaign wizard label (see Campaigns industries list). */
export function campaignIndustryFromOnboardingSlug(
  slug: string | null | undefined
): string {
  if (!slug) return '';
  const map: Record<string, string> = {
    realestate: 'Real Estate',
    saas: 'SaaS',
    healthcare: 'Healthcare',
    ecommerce: 'E-commerce',
    finance: 'Finance',
    consulting: 'Marketing',
    education: 'Education',
    legal: 'Legal',
  };
  return map[slug] ?? '';
}
