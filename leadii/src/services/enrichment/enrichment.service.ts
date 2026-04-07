/**
 * Enrichment workflow — Supabase for persistence; no Redis/BullMQ.
 * Jobs are recorded as rows; async processing can be added later (Edge Functions, etc.).
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createResearcherAgent, ResearcherAgent } from './researcher.agent';
import { CreditService } from '../credits/credit.service';

interface EnrichmentJob {
  leadId: string;
  userId: string;
  tenantId: string;
  campaignId: string;
}

interface EnrichmentResult {
  success: boolean;
  enrichmentId?: string;
  error?: string;
  creditsUsed: number;
}

function requireAdmin() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return db;
}

export class EnrichmentService {
  private agent: ResearcherAgent;
  private creditService: CreditService;

  constructor() {
    this.agent = createResearcherAgent({
      perplexityApiKey:
        process.env.PERPLEXITY_API_KEY || 'build-placeholder-perplexity',
      openaiApiKey:
        process.env.OPENAI_API_KEY || 'sk-build-placeholder-not-used-at-runtime',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxResearchTimeMs: 120000,
      minConfidenceThreshold: 0.5,
      enableSocialScraping: true,
    });

    this.creditService = new CreditService();
  }

  async queueEnrichment(
    campaignId: string,
    leadIds: string[],
    userId: string,
    tenantId: string
  ): Promise<{ queued: number; estimatedCredits: number }> {
    const db = requireAdmin();
    const estimatedCredits = leadIds.length * 2;
    const hasCredits = await this.creditService.hasSufficientCredits(
      userId,
      estimatedCredits
    );

    if (!hasCredits) {
      throw new Error('Insufficient credits for enrichment');
    }

    const { error: leadErr } = await db
      .from('leads')
      .update({ status: 'ENRICHING', updated_at: new Date().toISOString() })
      .in('id', leadIds)
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (leadErr) throw leadErr;

    const rows = leadIds.map((leadId) => ({
      lead_id: leadId,
      user_id: userId,
      tenant_id: tenantId,
      campaign_id: campaignId,
      status: 'QUEUED' as const,
      credits_used: 2,
    }));

    const { error: insErr } = await db.from('enrichments').insert(rows);
    if (insErr) throw insErr;

    return { queued: leadIds.length, estimatedCredits };
  }

  async processEnrichment(job: EnrichmentJob): Promise<EnrichmentResult> {
    const db = requireAdmin();
    const startTime = Date.now();

    try {
      await this.creditService.deductCredits({
        userId: job.userId,
        tenantId: job.tenantId,
        amount: 2,
        description: `Deep enrichment for lead ${job.leadId}`,
        relatedEntityType: 'ENRICHMENT',
        relatedEntityId: job.leadId,
      });

      const { data: lead, error: leadErr } = await db
        .from('leads')
        .select('*')
        .eq('id', job.leadId)
        .single();

      if (leadErr || !lead) {
        throw new Error('Lead not found');
      }

      const { data: enrichmentRow, error: enrSelErr } = await db
        .from('enrichments')
        .select('id')
        .eq('lead_id', job.leadId)
        .single();

      if (enrSelErr || !enrichmentRow) {
        throw new Error('Enrichment row not found');
      }

      await db
        .from('enrichments')
        .update({
          status: 'IN_PROGRESS',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrichmentRow.id);

      const researchResult = await this.agent.researchLead({
        id: lead.id,
        firstName: lead.first_name || undefined,
        lastName: lead.last_name || undefined,
        fullName: lead.full_name || undefined,
        email: lead.email || undefined,
        companyName: lead.company_name || undefined,
        jobTitle: lead.job_title || undefined,
        industry: lead.industry || undefined,
        linkedInUrl: lead.linkedin_url || undefined,
        website: lead.website || undefined,
        city: lead.city || undefined,
        state: lead.state || undefined,
        nicheType: lead.company_name ? 'B2B' : 'B2C',
      });

      await db
        .from('enrichments')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          company_overview: researchResult.companyOverview,
          recent_news: researchResult.recentNews as object,
          social_activity: researchResult.socialActivity as object,
          pain_points: researchResult.painPoints,
          opportunities: researchResult.opportunities,
          trigger_events: researchResult.triggerEvents as object,
          personalization_hints: researchResult.personalizationHints as object,
          conversation_starters: researchResult.conversationStarters,
          confidence_score: researchResult.confidenceScore,
          sources_used: researchResult.sourcesUsed as object,
          research_queries: researchResult.researchQueries,
          processing_time_ms: Date.now() - startTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrichmentRow.id);

      await db
        .from('leads')
        .update({ status: 'ENRICHED', updated_at: new Date().toISOString() })
        .eq('id', job.leadId);

      const { data: campaign } = await db
        .from('campaigns')
        .select('enriched_count')
        .eq('id', job.campaignId)
        .single();

      if (campaign) {
        await db
          .from('campaigns')
          .update({
            enriched_count: Number(campaign.enriched_count ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.campaignId);
      }

      return {
        success: true,
        enrichmentId: enrichmentRow.id,
        creditsUsed: 2,
      };
    } catch (error) {
      console.error('Enrichment failed:', error);

      await db
        .from('enrichments')
        .update({
          status: 'FAILED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('lead_id', job.leadId);

      await this.creditService.refundCredits({
        userId: job.userId,
        tenantId: job.tenantId,
        amount: 2,
        description: `Refund for failed enrichment: ${job.leadId}`,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        creditsUsed: 0,
      };
    }
  }

  async getEnrichmentStatus(leadId: string) {
    const db = requireAdmin();
    const { data: enrichment, error } = await db
      .from('enrichments')
      .select('*')
      .eq('lead_id', leadId)
      .maybeSingle();

    if (error) throw error;
    if (!enrichment) return null;

    const { data: lead } = await db
      .from('leads')
      .select('first_name, last_name, company_name, email')
      .eq('id', leadId)
      .maybeSingle();

    return {
      ...enrichment,
      lead: lead
        ? {
            firstName: lead.first_name,
            lastName: lead.last_name,
            companyName: lead.company_name,
            email: lead.email,
          }
        : null,
    };
  }

  async getCampaignEnrichmentStatus(campaignId: string) {
    const db = requireAdmin();

    const countFor = async (status: string) => {
      const { count, error } = await db
        .from('enrichments')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', status);
      if (error) throw error;
      return count ?? 0;
    };

    const { count: total, error: totalErr } = await db
      .from('enrichments')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    if (totalErr) throw totalErr;

    const { count: pendingQueued, error: pqErr } = await db
      .from('enrichments')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .in('status', ['PENDING', 'QUEUED']);
    if (pqErr) throw pqErr;

    const [inProgress, completed, failed] = await Promise.all([
      countFor('IN_PROGRESS'),
      countFor('COMPLETED'),
      countFor('FAILED'),
    ]);
    const pending = pendingQueued ?? 0;

    const t = total ?? 0;
    return {
      total: t,
      pending,
      inProgress,
      completed,
      failed,
      progress: t > 0 ? Math.round((completed / t) * 100) : 0,
    };
  }
}
