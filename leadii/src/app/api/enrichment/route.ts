/**
 * Enrichment API Routes
 * POST /api/enrichment - Start enrichment for leads
 * GET /api/enrichment - Get enrichment status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { EnrichmentService } from '@/services/enrichment/enrichment.service';
import { authOptions } from '@/lib/auth';
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';

const enrichmentService = new EnrichmentService();

// Validation schema
const startEnrichmentSchema = z.object({
  campaignId: z.string(),
  leadIds: z.array(z.string()).min(1).max(100),
});

/**
 * POST /api/enrichment
 * Start enrichment process for selected leads
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, leadIds } = startEnrichmentSchema.parse(body);

    // Start enrichment
    const result = await enrichmentService.queueEnrichment(
      campaignId,
      leadIds,
      session.user.id,
      session.user.tenantId
    );

    return NextResponse.json({
      success: true,
      message: `Enrichment queued for ${result.queued} leads`,
      queued: result.queued,
      estimatedCredits: result.estimatedCredits,
    });
  } catch (error) {
    console.error('Enrichment API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Insufficient credits') {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'CREDITS_REQUIRED' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start enrichment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enrichment
 * Get enrichment status for campaigns or specific leads
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const leadId = searchParams.get('leadId');

    if (leadId) {
      // Get enrichment for specific lead
      const enrichment = await enrichmentService.getEnrichmentStatus(leadId);
      return NextResponse.json({ enrichment });
    }

    if (campaignId) {
      // Get campaign-wide enrichment status
      const status = await enrichmentService.getCampaignEnrichmentStatus(campaignId);
      return NextResponse.json({ status });
    }

    return NextResponse.json(
      { error: 'Missing campaignId or leadId parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Enrichment Status API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get enrichment status' },
      { status: 500 }
    );
  }
}
