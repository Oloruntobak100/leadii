/**
 * Campaigns API Routes
 * GET /api/campaigns - List user's campaigns
 * POST /api/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nicheType: z.enum(['B2B', 'B2C']),
  industry: z.string().optional(),
  location: z.string().optional(),
  keywords: z.array(z.string()).min(1),
  sources: z.array(
    z.enum(['GOOGLE', 'LINKEDIN', 'YELLOW_PAGES', 'YELP', 'CRUNCHBASE'])
  ),
  minEmployees: z.number().optional(),
  maxEmployees: z.number().optional(),
  jobTitles: z.array(z.string()).optional(),
});

function mapCampaignRow(row: Record<string, unknown>) {
  const leads = row.leads as { count?: number }[] | undefined;
  const leadCount =
    Array.isArray(leads) && leads[0]?.count != null ? Number(leads[0].count) : 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    userId: row.user_id,
    tenantId: row.tenant_id,
    nicheType: row.niche_type,
    industry: row.industry,
    location: row.location,
    keywords: row.keywords,
    sources: row.sources,
    minEmployees: row.min_employees,
    maxEmployees: row.max_employees,
    jobTitles: row.job_titles,
    totalLeadsFound: row.total_leads_found,
    enrichedCount: row.enriched_count,
    contactedCount: row.contacted_count,
    respondedCount: row.responded_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    _count: { leads: leadCount },
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin()!;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let q = supabase
      .from('campaigns')
      .select('*, leads(count)')
      .eq('user_id', session.user.id)
      .eq('tenant_id', session.user.tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      q = q.eq('status', status);
    }

    const { data: campaigns, error } = await q;

    if (error) {
      console.error('Campaigns GET:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({
      campaigns: (campaigns ?? []).map((c) => mapCampaignRow(c as Record<string, unknown>)),
    });
  } catch (error) {
    console.error('Campaigns GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin()!;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    const { data: subscription, error: subErr } = await supabase
      .from('subscriptions')
      .select('max_campaigns')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (subErr) {
      console.error('Subscription lookup:', subErr);
    }

    const maxCampaigns = subscription?.max_campaigns ?? 5;

    const { count: currentCampaigns, error: cntErr } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    if (cntErr) {
      return NextResponse.json({ error: 'Failed to check campaign limit' }, { status: 500 });
    }

    if ((currentCampaigns ?? 0) >= maxCampaigns) {
      return NextResponse.json(
        {
          error: 'Campaign limit reached',
          message: `Your plan allows ${maxCampaigns} campaigns. Upgrade to create more.`,
          code: 'LIMIT_REACHED',
        },
        { status: 403 }
      );
    }

    const insert = {
      user_id: session.user.id,
      tenant_id: session.user.tenantId,
      name: validatedData.name,
      description: validatedData.description ?? null,
      status: 'DRAFT' as const,
      niche_type: validatedData.nicheType,
      industry: validatedData.industry ?? null,
      location: validatedData.location ?? null,
      keywords: validatedData.keywords,
      sources: validatedData.sources,
      min_employees: validatedData.minEmployees ?? null,
      max_employees: validatedData.maxEmployees ?? null,
      job_titles: validatedData.jobTitles ?? [],
    };

    const { data: campaign, error: insErr } = await supabase
      .from('campaigns')
      .insert(insert)
      .select()
      .single();

    if (insErr) {
      console.error('Campaign create:', insErr);
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        campaign: mapCampaignRow({ ...campaign, leads: [{ count: 0 }] } as Record<string, unknown>),
        message: 'Campaign created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Campaigns POST Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
