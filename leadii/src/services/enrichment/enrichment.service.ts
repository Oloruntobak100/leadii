/**
 * Enrichment Service
 * Orchestrates the enrichment workflow and manages the Researcher Agent
 */

import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { createResearcherAgent, ResearcherAgent } from './researcher.agent';
import { CreditService } from '../credits/credit.service';

const prisma = new PrismaClient();

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

export class EnrichmentService {
  private agent: ResearcherAgent;
  private creditService: CreditService;
  private enrichmentQueue: Queue;

  constructor() {
    this.agent = createResearcherAgent({
      perplexityApiKey: process.env.PERPLEXITY_API_KEY!,
      openaiApiKey: process.env.OPENAI_API_KEY!,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxResearchTimeMs: 120000,
      minConfidenceThreshold: 0.5,
      enableSocialScraping: true,
    });

    this.creditService = new CreditService();
    
    this.enrichmentQueue = new Queue('enrichment', {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    });
  }

  /**
   * Queue leads for enrichment
   */
  async queueEnrichment(
    campaignId: string,
    leadIds: string[],
    userId: string,
    tenantId: string
  ): Promise<{ queued: number; estimatedCredits: number }> {
    // Check if user has enough credits
    const estimatedCredits = leadIds.length * 2; // 2 credits per enrichment
    const hasCredits = await this.creditService.hasSufficientCredits(
      userId,
      estimatedCredits
    );

    if (!hasCredits) {
      throw new Error('Insufficient credits for enrichment');
    }

    // Update lead statuses
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { status: 'ENRICHING' },
    });

    // Create enrichment records
    const enrichments = await Promise.all(
      leadIds.map((leadId) =>
        prisma.enrichment.create({
          data: {
            leadId,
            userId,
            tenantId,
            campaignId,
            status: 'QUEUED',
            creditsUsed: 2,
          },
        })
      )
    );

    // Queue jobs
    await Promise.all(
      enrichments.map((enrichment) =>
        this.enrichmentQueue.add(
          'enrich-lead',
          {
            leadId: enrichment.leadId,
            userId,
            tenantId,
            campaignId,
            enrichmentId: enrichment.id,
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          }
        )
      )
    );

    return { queued: leadIds.length, estimatedCredits };
  }

  /**
   * Process a single enrichment job
   */
  async processEnrichment(job: EnrichmentJob): Promise<EnrichmentResult> {
    const startTime = Date.now();

    try {
      // Deduct credits first
      await this.creditService.deductCredits({
        userId: job.userId,
        tenantId: job.tenantId,
        amount: 2,
        description: `Deep enrichment for lead ${job.leadId}`,
        relatedEntityType: 'ENRICHMENT',
        relatedEntityId: job.leadId,
      });

      // Fetch lead data
      const lead = await prisma.lead.findUnique({
        where: { id: job.leadId },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Update enrichment status
      const enrichment = await prisma.enrichment.update({
        where: { leadId: job.leadId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      // Run AI research
      const researchResult = await this.agent.researchLead({
        id: lead.id,
        firstName: lead.firstName || undefined,
        lastName: lead.lastName || undefined,
        fullName: lead.fullName || undefined,
        email: lead.email || undefined,
        companyName: lead.companyName || undefined,
        jobTitle: lead.jobTitle || undefined,
        industry: lead.industry || undefined,
        linkedInUrl: lead.linkedInUrl || undefined,
        website: lead.website || undefined,
        city: lead.city || undefined,
        state: lead.state || undefined,
        nicheType: lead.companyName ? 'B2B' : 'B2C',
      });

      // Update enrichment with results
      await prisma.enrichment.update({
        where: { id: enrichment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          companyOverview: researchResult.companyOverview,
          recentNews: researchResult.recentNews as any,
          socialActivity: researchResult.socialActivity as any,
          painPoints: researchResult.painPoints,
          opportunities: researchResult.opportunities,
          triggerEvents: researchResult.triggerEvents as any,
          personalizationHints: researchResult.personalizationHints as any,
          conversationStarters: researchResult.conversationStarters,
          confidenceScore: researchResult.confidenceScore,
          sourcesUsed: researchResult.sourcesUsed as any,
          researchQueries: researchResult.researchQueries,
          processingTimeMs: Date.now() - startTime,
        },
      });

      // Update lead status
      await prisma.lead.update({
        where: { id: job.leadId },
        data: { status: 'ENRICHED' },
      });

      // Update campaign progress
      await prisma.campaign.update({
        where: { id: job.campaignId },
        data: { enrichedCount: { increment: 1 } },
      });

      return {
        success: true,
        enrichmentId: enrichment.id,
        creditsUsed: 2,
      };
    } catch (error) {
      console.error('Enrichment failed:', error);

      // Update enrichment status to failed
      await prisma.enrichment.updateMany({
        where: { leadId: job.leadId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      // Refund credits on failure
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

  /**
   * Get enrichment status for a lead
   */
  async getEnrichmentStatus(leadId: string) {
    return prisma.enrichment.findUnique({
      where: { leadId },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get enrichment queue status for a campaign
   */
  async getCampaignEnrichmentStatus(campaignId: string) {
    const [total, pending, inProgress, completed, failed] = await Promise.all([
      prisma.enrichment.count({ where: { campaignId } }),
      prisma.enrichment.count({ where: { campaignId, status: 'PENDING' } }),
      prisma.enrichment.count({ where: { campaignId, status: 'IN_PROGRESS' } }),
      prisma.enrichment.count({ where: { campaignId, status: 'COMPLETED' } }),
      prisma.enrichment.count({ where: { campaignId, status: 'FAILED' } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      failed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
