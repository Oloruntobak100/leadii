/**
 * Campaigns API Routes
 * GET /api/campaigns - List user's campaigns
 * POST /api/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schema for creating campaigns
const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nicheType: z.enum(['B2B', 'B2C']),
  industry: z.string().optional(),
  location: z.string().optional(),
  keywords: z.array(z.string()).min(1),
  sources: z.array(z.enum(['GOOGLE', 'LINKEDIN', 'YELLOW_PAGES', 'YELP', 'CRUNCHBASE'])),
  minEmployees: z.number().optional(),
  maxEmployees: z.number().optional(),
  jobTitles: z.array(z.string()).optional(),
});

/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Campaigns GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    // Check campaign limits based on subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const maxCampaigns = subscription?.maxCampaigns || 5;
    const currentCampaigns = await prisma.campaign.count({
      where: { userId: session.user.id },
    });

    if (currentCampaigns >= maxCampaigns) {
      return NextResponse.json(
        {
          error: 'Campaign limit reached',
          message: `Your plan allows ${maxCampaigns} campaigns. Upgrade to create more.`,
          code: 'LIMIT_REACHED',
        },
        { status: 403 }
      );
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        tenantId: session.user.tenantId,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(
      {
        success: true,
        campaign,
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
