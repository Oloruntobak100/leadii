export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  credits: number;
  subscription: 'free' | 'starter' | 'professional' | 'enterprise';
  /** Mirrors public.profiles.onboarding_completed */
  onboardingCompleted: boolean;
  /** public.profiles.onboarding_industry slug */
  onboardingIndustry: string | null;
  /** public.profiles.default_outreach_channel slug */
  defaultOutreachChannel: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scraping' | 'enriching' | 'ready' | 'completed' | 'paused';
  nicheType: 'B2B' | 'B2C';
  industry?: string;
  location?: string;
  keywords: string[];
  sources: DataSource[];
  totalLeadsFound: number;
  enrichedCount: number;
  contactedCount: number;
  createdAt: string;
}

export type DataSource = 'google' | 'linkedin' | 'yellow_pages' | 'yelp' | 'crunchbase';

export interface Lead {
  id: string;
  campaignId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  linkedInUrl?: string;
  city?: string;
  state?: string;
  status: 'discovered' | 'enriching' | 'enriched' | 'contacted' | 'responded';
  qualityScore?: number;
  enrichment?: Enrichment;
}

export interface Enrichment {
  id: string;
  leadId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  companyOverview?: string;
  recentNews: NewsItem[];
  painPoints: string[];
  opportunities: string[];
  triggerEvents: TriggerEvent[];
  personalizationHints: PersonalizationHints;
  conversationStarters: string[];
  confidenceScore: number;
  createdAt: string;
}

export interface NewsItem {
  title: string;
  url: string;
  date: string;
  summary: string;
  relevance: number;
}

export interface TriggerEvent {
  type: string;
  description: string;
  date: string;
  outreachAngle: string;
}

export interface PersonalizationHints {
  mutualInterests: string[];
  recentAchievements: string[];
  professionalChallenges: string[];
  communicationStyle: string;
  preferredTopics: string[];
  avoidTopics: string[];
}

export type OutreachChannel = 'whatsapp' | 'sms' | 'email' | 'linkedin';

export interface MessageTemplate {
  id: string;
  name: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
}

export interface OutreachMessage {
  id: string;
  leadId: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
}
