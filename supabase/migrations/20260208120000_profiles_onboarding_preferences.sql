-- Preferences collected during app onboarding (industry + default outreach channel).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_industry TEXT,
  ADD COLUMN IF NOT EXISTS default_outreach_channel TEXT;

COMMENT ON COLUMN public.profiles.onboarding_industry IS 'Slug from app onboarding (e.g. saas, healthcare).';
COMMENT ON COLUMN public.profiles.default_outreach_channel IS 'Slug: email, linkedin, whatsapp, sms.';
