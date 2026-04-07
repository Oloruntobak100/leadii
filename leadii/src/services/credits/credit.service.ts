/**
 * Credit ledger — backed by Supabase (credit_balances, credit_transactions).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type CreditTransactionType =
  | 'PURCHASE'
  | 'SUBSCRIPTION'
  | 'BONUS'
  | 'USAGE'
  | 'REFUND'
  | 'ADJUSTMENT';

interface CreditTransactionInput {
  userId: string;
  tenantId: string;
  amount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  stripePaymentId?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  creditAmount: number;
  priceCents: number;
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

export class CreditService {
  async getBalance(userId: string) {
    const db = requireAdmin();

    const { data: existing, error: selErr } = await db
      .from('credit_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (existing) return this.mapBalance(existing);

    const { data: profile, error: pErr } = await db
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    if (pErr || !profile?.tenant_id) {
      throw new Error('Profile not found for user');
    }

    const { data: created, error: insErr } = await db
      .from('credit_balances')
      .insert({
        user_id: userId,
        tenant_id: profile.tenant_id,
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
      })
      .select()
      .single();

    if (insErr) throw insErr;
    return this.mapBalance(created);
  }

  private mapBalance(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      tenantId: row.tenant_id as string,
      balance: Number(row.balance ?? 0),
      lifetimeEarned: Number(row.lifetime_earned ?? 0),
      lifetimeSpent: Number(row.lifetime_spent ?? 0),
    };
  }

  async hasSufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.balance >= requiredAmount;
  }

  async addCredits(input: CreditTransactionInput, type: CreditTransactionType) {
    const db = requireAdmin();
    const balanceRow = await this.getBalanceRow(db, input.userId, input.tenantId);
    const newBalance = Number(balanceRow.balance) + input.amount;

    const { error: upErr } = await db
      .from('credit_balances')
      .update({
        balance: newBalance,
        ...(type === 'PURCHASE' || type === 'SUBSCRIPTION' || type === 'BONUS'
          ? { lifetime_earned: Number(balanceRow.lifetime_earned) + input.amount }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', input.userId);

    if (upErr) throw upErr;

    const { data: tx, error: txErr } = await db
      .from('credit_transactions')
      .insert({
        user_id: input.userId,
        tenant_id: input.tenantId,
        type,
        amount: input.amount,
        balance_after: newBalance,
        description: input.description,
        related_entity_type: input.relatedEntityType ?? null,
        related_entity_id: input.relatedEntityId ?? null,
        stripe_payment_id: input.stripePaymentId ?? null,
      })
      .select()
      .single();

    if (txErr) throw txErr;

    return {
      balance: newBalance,
      transaction: this.mapTransaction(tx),
    };
  }

  async deductCredits(input: CreditTransactionInput) {
    const db = requireAdmin();
    const balanceRow = await this.getBalanceRow(db, input.userId, input.tenantId);
    const current = Number(balanceRow.balance);

    if (current < input.amount) {
      throw new Error('Insufficient credits');
    }

    const newBalance = current - input.amount;

    const { error: upErr } = await db
      .from('credit_balances')
      .update({
        balance: newBalance,
        lifetime_spent: Number(balanceRow.lifetime_spent) + input.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', input.userId);

    if (upErr) throw upErr;

    const { data: tx, error: txErr } = await db
      .from('credit_transactions')
      .insert({
        user_id: input.userId,
        tenant_id: input.tenantId,
        type: 'USAGE',
        amount: -input.amount,
        balance_after: newBalance,
        description: input.description,
        related_entity_type: input.relatedEntityType ?? null,
        related_entity_id: input.relatedEntityId ?? null,
      })
      .select()
      .single();

    if (txErr) throw txErr;

    return { balance: newBalance, transaction: this.mapTransaction(tx) };
  }

  private async getBalanceRow(db: SupabaseClient, userId: string, tenantId: string) {
    const { data, error } = await db
      .from('credit_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: created, error: insErr } = await db
      .from('credit_balances')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
      })
      .select()
      .single();

    if (insErr) throw insErr;
    return created;
  }

  private mapTransaction(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      tenantId: row.tenant_id as string,
      type: row.type as CreditTransactionType,
      amount: Number(row.amount),
      balanceAfter: Number(row.balance_after),
      description: row.description as string,
      relatedEntityType: row.related_entity_type as string | null,
      relatedEntityId: row.related_entity_id as string | null,
      stripePaymentId: row.stripe_payment_id as string | null,
      createdAt: row.created_at as string,
    };
  }

  async refundCredits(input: CreditTransactionInput) {
    return this.addCredits(input, 'REFUND');
  }

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

  async getTransactionHistory(userId: string, limit: number = 50) {
    const db = requireAdmin();
    const { data, error } = await db
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => this.mapTransaction(row));
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    const db = requireAdmin();
    const { data, error } = await db
      .from('credit_packages')
      .select('id, name, credit_amount, price_cents')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      creditAmount: Number(row.credit_amount),
      priceCents: row.price_cents as number,
    }));
  }

  async purchaseCredits(
    userId: string,
    tenantId: string,
    packageId: string,
    stripePaymentId: string
  ) {
    const db = requireAdmin();
    const { data: pkg, error } = await db
      .from('credit_packages')
      .select('id, name, credit_amount')
      .eq('id', packageId)
      .single();

    if (error || !pkg) throw new Error('Credit package not found');

    return this.addCredits(
      {
        userId,
        tenantId,
        amount: Number(pkg.credit_amount),
        description: `Purchased ${pkg.name}`,
        stripePaymentId,
      },
      'PURCHASE'
    );
  }

  async getUsageStats(userId: string, days: number = 30) {
    const db = requireAdmin();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();

    const { data: txs, error } = await db
      .from('credit_transactions')
      .select('type, amount, related_entity_type')
      .eq('user_id', userId)
      .gte('created_at', sinceIso);

    if (error) throw error;

    let creditsAdded = 0;
    let creditsUsed = 0;
    const byType = new Map<string, number>();

    for (const row of txs ?? []) {
      const t = row.type as string;
      const amt = Number(row.amount);
      if (t === 'PURCHASE' || t === 'SUBSCRIPTION' || t === 'BONUS') {
        creditsAdded += amt;
      } else if (t === 'USAGE') {
        creditsUsed += Math.abs(amt);
        const key = (row.related_entity_type as string) || 'OTHER';
        byType.set(key, (byType.get(key) ?? 0) + Math.abs(amt));
      }
    }

    return {
      period: days,
      creditsAdded,
      creditsUsed,
      usageByType: Array.from(byType.entries()).map(([type, amount]) => ({ type, amount })),
    };
  }
}

export const CREDIT_COSTS = {
  SCRAPE_LEAD: 0.1,
  DEEP_ENRICHMENT: 2.0,
  WHATSAPP_MESSAGE: 0.5,
  SMS_MESSAGE: 0.3,
  EMAIL_MESSAGE: 0.2,
  LINKEDIN_DM: 0.4,
} as const;
