-- =============================================================================
-- Leadii — Supabase schema (auth.users + public.*)
-- Run in Supabase SQL Editor or via CLI: supabase db push
-- Replaces app-managed users/sessions; uses Supabase Auth for identity.
-- =============================================================================

-- Extensions (gen_random_uuid is in pgcrypto on older PG; Supabase has it built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMs (Postgres native; map 1:1 to former Prisma enums)
-- -----------------------------------------------------------------------------
CREATE TYPE public.campaign_status AS ENUM (
  'DRAFT', 'QUEUED', 'SCRAPING', 'SCRAPING_COMPLETED', 'ENRICHING',
  'ENRICHMENT_COMPLETED', 'OUTREACH_READY', 'COMPLETED', 'PAUSED', 'FAILED'
);

CREATE TYPE public.niche_type AS ENUM ('B2B', 'B2C');

CREATE TYPE public.data_source AS ENUM (
  'GOOGLE', 'LINKEDIN', 'YELLOW_PAGES', 'YELP', 'CRUNCHBASE',
  'APOLLO', 'HUNTER', 'MANUAL_UPLOAD', 'API_INTEGRATION'
);

CREATE TYPE public.lead_status AS ENUM (
  'DISCOVERED', 'VALIDATED', 'ENRICHING', 'ENRICHED', 'QUEUED',
  'CONTACTED', 'RESPONDED', 'CONVERTED', 'DISQUALIFIED', 'BOUNCED', 'UNSUBSCRIBED'
);

CREATE TYPE public.enrichment_status AS ENUM (
  'PENDING', 'QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL'
);

CREATE TYPE public.outreach_channel AS ENUM (
  'WHATSAPP', 'SMS', 'EMAIL', 'LINKEDIN_DM', 'TWITTER_DM', 'INSTAGRAM_DM'
);

CREATE TYPE public.message_status AS ENUM (
  'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED', 'RESPONDED'
);

CREATE TYPE public.response_type AS ENUM (
  'POSITIVE', 'NEGATIVE', 'NEUTRAL', 'AUTO_REPLY', 'OUT_OF_OFFICE'
);

CREATE TYPE public.transaction_type AS ENUM (
  'PURCHASE', 'SUBSCRIPTION', 'BONUS', 'USAGE', 'REFUND', 'ADJUSTMENT'
);

CREATE TYPE public.subscription_plan AS ENUM (
  'FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
);

CREATE TYPE public.subscription_status AS ENUM (
  'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE',
  'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED'
);

CREATE TYPE public.integration_provider AS ENUM (
  'LINKEDIN', 'SALESFORCE', 'HUBSPOT', 'PIPEDRIVE', 'ZAPIER',
  'MAKE', 'GOOGLE_SHEETS', 'SLACK'
);

-- -----------------------------------------------------------------------------
-- Tenants (workspace / org). One created per signup; solo users own their tenant.
-- -----------------------------------------------------------------------------
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_created_at ON public.tenants (created_at);

-- -----------------------------------------------------------------------------
-- Profiles — 1:1 with auth.users (signup stores full_name, trial window)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_tenant_id ON public.profiles (tenant_id);

-- -----------------------------------------------------------------------------
-- Campaigns → Leads → Enrichment / Outreach (core product graph)
-- -----------------------------------------------------------------------------
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status public.campaign_status NOT NULL DEFAULT 'DRAFT',
  niche_type public.niche_type NOT NULL,
  industry TEXT,
  location TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  sources public.data_source[] NOT NULL DEFAULT '{}',
  min_employees INT,
  max_employees INT,
  job_titles TEXT[] NOT NULL DEFAULT '{}',
  total_leads_found INT NOT NULL DEFAULT 0,
  enriched_count INT NOT NULL DEFAULT 0,
  contacted_count INT NOT NULL DEFAULT 0,
  responded_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_tenant_id ON public.campaigns (tenant_id);
CREATE INDEX idx_campaigns_user_id ON public.campaigns (user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns (status);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  company_name TEXT,
  company_size TEXT,
  industry TEXT,
  job_title TEXT,
  seniority TEXT,
  department TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website TEXT,
  status public.lead_status NOT NULL DEFAULT 'DISCOVERED',
  quality_score DOUBLE PRECISION,
  source public.data_source NOT NULL,
  source_url TEXT,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_leads_tenant_email_unique ON public.leads (tenant_id, lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;

CREATE INDEX idx_leads_campaign_id ON public.leads (campaign_id);
CREATE INDEX idx_leads_tenant_id ON public.leads (tenant_id);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_company_name ON public.leads (company_name);

CREATE TABLE public.enrichments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  lead_id UUID NOT NULL UNIQUE REFERENCES public.leads (id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  status public.enrichment_status NOT NULL DEFAULT 'PENDING',
  company_overview TEXT,
  recent_news JSONB,
  social_activity JSONB,
  pain_points TEXT[] NOT NULL DEFAULT '{}',
  opportunities TEXT[] NOT NULL DEFAULT '{}',
  trigger_events JSONB,
  personalization_hints JSONB,
  conversation_starters TEXT[] NOT NULL DEFAULT '{}',
  suggested_subject TEXT,
  suggested_body TEXT,
  research_queries TEXT[] NOT NULL DEFAULT '{}',
  sources_used JSONB,
  confidence_score DOUBLE PRECISION,
  credits_used DOUBLE PRECISION NOT NULL DEFAULT 2,
  processing_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_enrichments_tenant_id ON public.enrichments (tenant_id);
CREATE INDEX idx_enrichments_campaign_id ON public.enrichments (campaign_id);
CREATE INDEX idx_enrichments_status ON public.enrichments (status);

CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  channel public.outreach_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  use_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_templates_tenant_id ON public.message_templates (tenant_id);

CREATE TABLE public.outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns (id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.message_templates (id) ON DELETE SET NULL,
  channel public.outreach_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  body_personalized TEXT,
  status public.message_status NOT NULL DEFAULT 'QUEUED',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_content TEXT,
  response_type public.response_type,
  external_id TEXT,
  credits_used DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_tenant_id ON public.outreach_messages (tenant_id);
CREATE INDEX idx_outreach_lead_id ON public.outreach_messages (lead_id);
CREATE INDEX idx_outreach_status ON public.outreach_messages (status);
CREATE INDEX idx_outreach_channel ON public.outreach_messages (channel);

-- -----------------------------------------------------------------------------
-- Credits & billing
-- -----------------------------------------------------------------------------
CREATE TABLE public.credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  lifetime_earned DOUBLE PRECISION NOT NULL DEFAULT 0,
  lifetime_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_balances_tenant_id ON public.credit_balances (tenant_id);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  balance_after DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_tx_tenant_id ON public.credit_transactions (tenant_id);
CREATE INDEX idx_credit_tx_user_id ON public.credit_transactions (user_id);
CREATE INDEX idx_credit_tx_type ON public.credit_transactions (type);

CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credit_amount DOUBLE PRECISION NOT NULL,
  price_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_price_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL,
  status public.subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  monthly_credits INT NOT NULL DEFAULT 0,
  max_campaigns INT NOT NULL DEFAULT 5,
  max_leads_per_campaign INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_tenant_id ON public.subscriptions (tenant_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions (stripe_customer_id);

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_tenant_id ON public.invoices (tenant_id);
CREATE INDEX idx_invoices_user_id ON public.invoices (user_id);

-- -----------------------------------------------------------------------------
-- Integrations (OAuth tokens — encrypt at app layer or use Vault in production)
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  provider public.integration_provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

CREATE INDEX idx_user_integrations_tenant_id ON public.user_integrations (tenant_id);

-- -----------------------------------------------------------------------------
-- Optional: AI / research audit trail (50+ sources, job tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE public.research_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads (id) ON DELETE SET NULL,
  enrichment_id UUID REFERENCES public.enrichments (id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  summary TEXT,
  raw_payload JSONB,
  relevance_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_events_lead_id ON public.research_events (lead_id);
CREATE INDEX idx_research_events_enrichment_id ON public.research_events (enrichment_id);

-- -----------------------------------------------------------------------------
-- Trigger: new auth user → tenant + profile + credit row + starter subscription stub
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  display_name TEXT;
BEGIN
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NULLIF(trim(split_part(NEW.email, '@', 1)), ''),
    'User'
  );

  INSERT INTO public.tenants (name)
  VALUES (COALESCE(display_name, 'My') || ' workspace')
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.profiles (id, tenant_id, full_name, trial_started_at, trial_ends_at, subscription_tier)
  VALUES (
    NEW.id,
    new_tenant_id,
    display_name,
    now(),
    now() + interval '14 days',
    'free'
  );

  INSERT INTO public.credit_balances (tenant_id, user_id, balance, lifetime_earned)
  VALUES (new_tenant_id, NEW.id, 100, 100);

  INSERT INTO public.credit_transactions (tenant_id, user_id, type, amount, balance_after, description)
  VALUES (new_tenant_id, NEW.id, 'BONUS', 100, 100, 'Welcome credits');

  INSERT INTO public.subscriptions (
    tenant_id, user_id, plan, status,
    current_period_start, current_period_end,
    stripe_customer_id, stripe_subscription_id, stripe_price_id,
    monthly_credits, max_campaigns, max_leads_per_campaign
  )
  VALUES (
    new_tenant_id, NEW.id, 'FREE', 'TRIALING',
    now(), now() + interval '14 days',
    'pending', 'pending', 'pending',
    100, 3, 100
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_enrichments_updated_at BEFORE UPDATE ON public.enrichments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_templates_updated_at BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_outreach_updated_at BEFORE UPDATE ON public.outreach_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_credit_balances_updated_at BEFORE UPDATE ON public.credit_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_integrations_updated_at BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_credit_packages_updated_at BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_events ENABLE ROW LEVEL SECURITY;

-- Helper: tenant ids the current user belongs to
CREATE OR REPLACE FUNCTION public.user_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Tenants: member can read own tenant
CREATE POLICY tenants_select ON public.tenants FOR SELECT
  USING (id IN (SELECT public.user_tenant_ids()));

-- Profiles: user reads/updates own row
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Domain tables: tenant-scoped
CREATE POLICY campaigns_all ON public.campaigns FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY leads_all ON public.leads FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY enrichments_all ON public.enrichments FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY templates_all ON public.message_templates FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY outreach_all ON public.outreach_messages FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY credit_balances_all ON public.credit_balances FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY credit_tx_all ON public.credit_transactions FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

-- Catalog: readable by any authenticated user (adjust if you prefer service-role only)
CREATE POLICY credit_packages_select ON public.credit_packages FOR SELECT
  TO authenticated USING (is_active = true);

CREATE POLICY subscriptions_all ON public.subscriptions FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY invoices_all ON public.invoices FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY integrations_all ON public.user_integrations FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY research_events_all ON public.research_events FOR ALL
  USING (tenant_id IN (SELECT public.user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

-- -----------------------------------------------------------------------------
-- Seed credit packages (replace stripe_price_id with real IDs from Stripe)
-- -----------------------------------------------------------------------------
INSERT INTO public.credit_packages (name, description, credit_amount, price_cents, stripe_price_id, is_popular, sort_order)
SELECT v.name, v.description, v.credit_amount, v.price_cents, v.stripe_price_id, v.is_popular, v.sort_order
FROM (VALUES
  ('Explorer'::text, '1,000 credits / month'::text, 1000::double precision, 4900, 'price_explorer_placeholder'::text, false, 1),
  ('Empire', '5,000 credits / month', 5000, 14900, 'price_empire_placeholder', true, 2),
  ('Enterprise', 'Custom', 0, 0, 'price_enterprise_placeholder', false, 3)
) AS v(name, description, credit_amount, price_cents, stripe_price_id, is_popular, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.credit_packages p WHERE p.name = v.name);
