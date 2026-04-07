/**
 * Multi-channel outreach — Supabase for persistence; no Redis/BullMQ.
 * Sending is invoked directly (e.g. processMessage); scale-out can use Supabase queues or Edge Functions later.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { CreditService, CREDIT_COSTS } from '../credits/credit.service';
import { WhatsAppAdapter } from './whatsapp.adapter';
import { SMSAdapter } from './sms.adapter';
import { EmailAdapter } from './email.adapter';

export type OutreachChannel =
  | 'WHATSAPP'
  | 'SMS'
  | 'EMAIL'
  | 'LINKEDIN_DM'
  | 'TWITTER_DM'
  | 'INSTAGRAM_DM';

function requireAdmin() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return db;
}

interface SendMessageInput {
  leadId: string;
  userId: string;
  tenantId: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  templateId?: string;
  campaignId?: string;
}

interface BatchSendInput {
  leadIds: string[];
  userId: string;
  tenantId: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  templateId?: string;
  campaignId?: string;
  personalize: boolean;
}

export class OutreachService {
  private creditService: CreditService;
  private whatsappAdapter: WhatsAppAdapter;
  private smsAdapter: SMSAdapter;
  private emailAdapter: EmailAdapter;

  constructor() {
    this.creditService = new CreditService();
    this.whatsappAdapter = new WhatsAppAdapter();
    this.smsAdapter = new SMSAdapter();
    this.emailAdapter = new EmailAdapter();
  }

  async sendMessage(input: SendMessageInput) {
    const db = requireAdmin();
    const creditCost = this.getChannelCreditCost(input.channel);

    const hasCredits = await this.creditService.hasSufficientCredits(
      input.userId,
      creditCost
    );

    if (!hasCredits) {
      throw new Error('Insufficient credits');
    }

    await this.creditService.deductCredits({
      userId: input.userId,
      tenantId: input.tenantId,
      amount: creditCost,
      description: `${input.channel} message to lead ${input.leadId}`,
      relatedEntityType: 'OUTREACH',
      relatedEntityId: input.leadId,
    });

    const { data: message, error } = await db
      .from('outreach_messages')
      .insert({
        user_id: input.userId,
        tenant_id: input.tenantId,
        lead_id: input.leadId,
        campaign_id: input.campaignId ?? null,
        template_id: input.templateId ?? null,
        channel: input.channel,
        subject: input.subject ?? null,
        body: input.body,
        status: 'QUEUED',
        credits_used: creditCost,
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  }

  async sendBatch(input: BatchSendInput) {
    const db = requireAdmin();
    const creditCost = this.getChannelCreditCost(input.channel);
    const totalCost = creditCost * input.leadIds.length;

    const hasCredits = await this.creditService.hasSufficientCredits(
      input.userId,
      totalCost
    );

    if (!hasCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }

    const { data: leads, error: leadsErr } = await db
      .from('leads')
      .select('id, first_name, last_name, company_name, email, phone, mobile')
      .in('id', input.leadIds)
      .eq('user_id', input.userId);

    if (leadsErr) throw leadsErr;

    const enrichmentByLead = new Map<string, Record<string, unknown>>();
    if (input.personalize && leads?.length) {
      const { data: enrichments } = await db
        .from('enrichments')
        .select('*')
        .in(
          'lead_id',
          leads.map((l) => l.id as string)
        );
      for (const e of enrichments ?? []) {
        enrichmentByLead.set(e.lead_id as string, e as Record<string, unknown>);
      }
    }

    const messages: Record<string, unknown>[] = [];

    for (const lead of leads ?? []) {
      const lid = lead.id as string;
      let bodyText = input.body;
      const enr = enrichmentByLead.get(lid);
      if (input.personalize && enr) {
        bodyText = this.personalizeMessage(input.body, lead, enr);
      }

      await this.creditService.deductCredits({
        userId: input.userId,
        tenantId: input.tenantId,
        amount: creditCost,
        description: `${input.channel} message to lead ${lid}`,
        relatedEntityType: 'OUTREACH',
        relatedEntityId: lid,
      });

      const { data: msg, error: insErr } = await db
        .from('outreach_messages')
        .insert({
          user_id: input.userId,
          tenant_id: input.tenantId,
          lead_id: lid,
          campaign_id: input.campaignId ?? null,
          template_id: input.templateId ?? null,
          channel: input.channel,
          subject: input.subject ?? null,
          body: input.body,
          body_personalized: bodyText,
          status: 'QUEUED',
          credits_used: creditCost,
        })
        .select()
        .single();

      if (insErr) throw insErr;
      messages.push(msg);
    }

    if (input.campaignId && messages.length > 0) {
      const { data: camp } = await db
        .from('campaigns')
        .select('contacted_count')
        .eq('id', input.campaignId)
        .single();

      if (camp) {
        await db
          .from('campaigns')
          .update({
            contacted_count: Number(camp.contacted_count ?? 0) + messages.length,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.campaignId);
      }
    }

    return {
      queued: messages.length,
      totalCredits: totalCost,
      messages,
    };
  }

  async processMessage(messageId: string): Promise<boolean> {
    const db = requireAdmin();

    const { data: message, error: msgErr } = await db
      .from('outreach_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (msgErr || !message) {
      throw new Error('Message not found');
    }

    const { data: lead, error: leadErr } = await db
      .from('leads')
      .select('*')
      .eq('id', message.lead_id as string)
      .single();

    if (leadErr || !lead) {
      throw new Error('Lead not found');
    }

    await db
      .from('outreach_messages')
      .update({ status: 'SENDING', updated_at: new Date().toISOString() })
      .eq('id', messageId);

    try {
      let result: { success: boolean; externalId?: string; error?: string };
      const channel = message.channel as OutreachChannel;
      const personalized =
        (message.body_personalized as string) || (message.body as string);

      switch (channel) {
        case 'WHATSAPP':
          result = await this.whatsappAdapter.send({
            to: (lead.mobile as string) || (lead.phone as string)!,
            body: personalized,
          });
          break;

        case 'SMS':
          result = await this.smsAdapter.send({
            to: (lead.mobile as string) || (lead.phone as string)!,
            body: personalized,
          });
          break;

        case 'EMAIL':
          result = await this.emailAdapter.send({
            to: lead.email as string,
            subject: (message.subject as string)!,
            body: personalized,
          });
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      if (result.success) {
        await db
          .from('outreach_messages')
          .update({
            status: 'SENT',
            external_id: result.externalId ?? null,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', messageId);

        await db
          .from('leads')
          .update({ status: 'CONTACTED', updated_at: new Date().toISOString() })
          .eq('id', message.lead_id as string);

        return true;
      }

      throw new Error(result.error || 'Send failed');
    } catch (error) {
      console.error('Outreach send failed:', error);

      await db
        .from('outreach_messages')
        .update({ status: 'FAILED', updated_at: new Date().toISOString() })
        .eq('id', messageId);

      await this.creditService.refundCredits({
        userId: message.user_id as string,
        tenantId: message.tenant_id as string,
        amount: Number(message.credits_used),
        description: `Refund for failed ${message.channel} message`,
      });

      return false;
    }
  }

  async getMessageStats(userId: string, days: number = 30) {
    const db = requireAdmin();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: rows, error } = await db
      .from('outreach_messages')
      .select('channel, status')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString());

    if (error) throw error;

    const map = new Map<string, number>();
    for (const r of rows ?? []) {
      const key = `${r.channel}:${r.status}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([key, _count]) => {
      const [channel, status] = key.split(':');
      return { channel, status, _count };
    });
  }

  private getChannelCreditCost(channel: OutreachChannel): number {
    switch (channel) {
      case 'WHATSAPP':
        return CREDIT_COSTS.WHATSAPP_MESSAGE;
      case 'SMS':
        return CREDIT_COSTS.SMS_MESSAGE;
      case 'EMAIL':
        return CREDIT_COSTS.EMAIL_MESSAGE;
      case 'LINKEDIN_DM':
        return CREDIT_COSTS.LINKEDIN_DM;
      default:
        return 0.5;
    }
  }

  private personalizeMessage(
    template: string,
    lead: Record<string, unknown>,
    enrichment: Record<string, unknown>
  ): string {
    let message = template;

    message = message.replace(/\{\{firstName\}\}/g, (lead.first_name as string) || '');
    message = message.replace(/\{\{lastName\}\}/g, (lead.last_name as string) || '');
    message = message.replace(/\{\{company\}\}/g, (lead.company_name as string) || '');
    message = message.replace(/\{\{jobTitle\}\}/g, (lead.job_title as string) || '');

    const painPoints = enrichment.pain_points as string[] | undefined;
    const opportunities = enrichment.opportunities as string[] | undefined;
    const starters = enrichment.conversation_starters as string[] | undefined;

    message = message.replace(/\{\{painPoint\}\}/g, painPoints?.[0] || '');
    message = message.replace(/\{\{opportunity\}\}/g, opportunities?.[0] || '');
    message = message.replace(/\{\{conversationStarter\}\}/g, starters?.[0] || '');

    return message;
  }
}
