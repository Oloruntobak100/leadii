/**
 * Enrichment Worker
 * BullMQ worker for processing enrichment jobs
 */

import { Worker, Job } from 'bullmq';
import { EnrichmentService } from '@/services/enrichment/enrichment.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const enrichmentService = new EnrichmentService();

interface EnrichmentJobData {
  leadId: string;
  userId: string;
  tenantId: string;
  campaignId: string;
  enrichmentId: string;
}

// Create the worker
export const enrichmentWorker = new Worker<EnrichmentJobData>(
  'enrichment',
  async (job: Job<EnrichmentJobData>) => {
    const { leadId, userId, tenantId, campaignId, enrichmentId } = job.data;

    console.log(`[EnrichmentWorker] Starting enrichment for lead ${leadId}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Process the enrichment
      const result = await enrichmentService.processEnrichment({
        leadId,
        userId,
        tenantId,
        campaignId,
      });

      await job.updateProgress(100);

      if (result.success) {
        console.log(`[EnrichmentWorker] Completed enrichment for lead ${leadId}`);
        return { success: true, enrichmentId: result.enrichmentId };
      } else {
        throw new Error(result.error || 'Enrichment failed');
      }
    } catch (error) {
      console.error(`[EnrichmentWorker] Failed enrichment for lead ${leadId}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    },
    concurrency: 3, // Process up to 3 enrichments concurrently
    limiter: {
      max: 10,
      duration: 60000, // 10 enrichments per minute
    },
  }
);

// Event handlers
enrichmentWorker.on('completed', (job) => {
  console.log(`[EnrichmentWorker] Job ${job.id} completed`);
});

enrichmentWorker.on('failed', (job, error) => {
  console.error(`[EnrichmentWorker] Job ${job?.id} failed:`, error);
});

enrichmentWorker.on('progress', (job, progress) => {
  console.log(`[EnrichmentWorker] Job ${job.id} progress: ${progress}%`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[EnrichmentWorker] SIGTERM received, closing worker...');
  await enrichmentWorker.close();
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('[EnrichmentWorker] SIGINT received, closing worker...');
  await enrichmentWorker.close();
  await prisma.$disconnect();
});

console.log('[EnrichmentWorker] Started and waiting for jobs...');
