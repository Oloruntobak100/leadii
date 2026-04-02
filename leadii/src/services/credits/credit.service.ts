/**
 * Credit Service
 * Manages the credit ledger system for Leadii
 */

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreditTransactionInput {
  userId: string;
  tenantId: string;
  amount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  stripePaymentId?: string;
}

interface CreditPackage {
  id: string;
  name: string;
  creditAmount: number;
  priceCents: number;
}

export class CreditService {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string) {
    const balance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      // Create initial balance
      return prisma.creditBalance.create({
        data: {
          userId,
          tenantId: userId, // Simplified - would come from auth context
          balance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });
    }

    return balance;
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.balance >= requiredAmount;
  }

  /**
   * Add credits to user account (purchase, bonus, subscription)
   */
  async addCredits(
    input: CreditTransactionInput,
    type: TransactionType
  ) {
    return prisma.$transaction(async (tx) => {
      // Get or create balance
      let balance = await tx.creditBalance.findUnique({
        where: { userId: input.userId },
      });

      if (!balance) {
        balance = await tx.creditBalance.create({
          data: {
            userId: input.userId,
            tenantId: input.tenantId,
            balance: 0,
            lifetimeEarned: 0,
            lifetimeSpent: 0,
          },
        });
      }

      const newBalance = balance.balance + input.amount;

      // Update balance
      await tx.creditBalance.update({
        where: { userId: input.userId },
        data: {
          balance: newBalance,
          lifetimeEarned:
            type === 'PURCHASE' || type === 'SUBSCRIPTION' || type === 'BONUS'
              ? { increment: input.amount }
              : undefined,
        },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: input.userId,
          tenantId: input.tenantId,
          type,
          amount: input.amount,
          balanceAfter: newBalance,
          description: input.description,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
          stripePaymentId: input.stripePaymentId,
        },
      });

      return { balance: newBalance, transaction };
    });
  }

  /**
   * Deduct credits for usage
   */
  async deductCredits(input: CreditTransactionInput) {
    return prisma.$transaction(async (tx) => {
      const balance = await tx.creditBalance.findUnique({
        where: { userId: input.userId },
      });

      if (!balance || balance.balance < input.amount) {
        throw new Error('Insufficient credits');
      }

      const newBalance = balance.balance - input.amount;

      // Update balance
      await tx.creditBalance.update({
        where: { userId: input.userId },
        data: {
          balance: newBalance,
          lifetimeSpent: { increment: input.amount },
        },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: input.userId,
          tenantId: input.tenantId,
          type: 'USAGE',
          amount: -input.amount,
          balanceAfter: newBalance,
          description: input.description,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
        },
      });

      return { balance: newBalance, transaction };
    });
  }

  /**
   * Refund credits (e.g., for failed operations)
   */
  async refundCredits(input: CreditTransactionInput) {
    return this.addCredits(input, 'REFUND');
  }

  /**
   * Grant subscription credits (monthly reset)
   */
  async grantSubscriptionCredits(
    userId: string,
    tenantId: string,
    amount: number,
    subscriptionId: string
  ) {
    return this.addCredits(
      {
        userId,
        tenantId,
        amount,
        description: 'Monthly subscription credits',
        relatedEntityType: 'SUBSCRIPTION',
        relatedEntityId: subscriptionId,
      },
      'SUBSCRIPTION'
    );
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get credit packages for purchase
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Purchase credits via Stripe
   */
  async purchaseCredits(
    userId: string,
    tenantId: string,
    packageId: string,
    stripePaymentId: string
  ) {
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
    });

    if (!creditPackage) {
      throw new Error('Credit package not found');
    }

    return this.addCredits(
      {
        userId,
        tenantId,
        amount: creditPackage.creditAmount,
        description: `Purchased ${creditPackage.name}`,
        stripePaymentId,
      },
      'PURCHASE'
    );
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [purchases, usage, byType] = await Promise.all([
      prisma.creditTransaction.aggregate({
        where: {
          userId,
          type: { in: ['PURCHASE', 'SUBSCRIPTION', 'BONUS'] },
          createdAt: { gte: since },
        },
        _sum: { amount: true },
      }),
      prisma.creditTransaction.aggregate({
        where: {
          userId,
          type: 'USAGE',
          createdAt: { gte: since },
        },
        _sum: { amount: true },
      }),
      prisma.creditTransaction.groupBy({
        by: ['relatedEntityType'],
        where: {
          userId,
          type: 'USAGE',
          createdAt: { gte: since },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      period: days,
      creditsAdded: purchases._sum.amount || 0,
      creditsUsed: Math.abs(usage._sum.amount || 0),
      usageByType: byType.map((item) => ({
        type: item.relatedEntityType || 'OTHER',
        amount: Math.abs(item._sum.amount || 0),
      })),
    };
  }
}

// Cost matrix for operations
export const CREDIT_COSTS = {
  SCRAPE_LEAD: 0.1,
  DEEP_ENRICHMENT: 2.0,
  WHATSAPP_MESSAGE: 0.5,
  SMS_MESSAGE: 0.3,
  EMAIL_MESSAGE: 0.2,
  LINKEDIN_DM: 0.4,
} as const;
