/**
 * Outreach Service
 * Manages multi-channel outreach campaigns
 */

import { PrismaClient, OutreachChannel, MessageStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { CreditService, CREDIT_COSTS } from '../credits/credit.service';
import { WhatsAppAdapter } from './whatsapp.adapter';
import { SMSAdapter } from './sms.adapter';
import { EmailAdapter } from './email.adapter';

const prisma = new PrismaClient();

function redisConfigured(): boolean {
  return Boolean(
    process.env.REDIS_URL ||
      (process.env.REDIS_HOST && process.env.REDIS_HOST.length > 0)
  );
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
  private outreachQueue: Queue | null;
  private whatsappAdapter: WhatsAppAdapter;
  private smsAdapter: SMSAdapter;
  private emailAdapter: EmailAdapter;

  constructor() {
    this.creditService = new CreditService();

    this.outreachQueue = redisConfigured()
      ? new Queue('outreach', {
          connection: process.env.REDIS_URL
            ? { url: process.env.REDIS_URL }
            : {
                host: process.env.REDIS_HOST!,
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD,
              },
        })
      : null;

    this.whatsappAdapter = new WhatsAppAdapter();
    this.smsAdapter = new SMSAdapter();
    this.emailAdapter = new EmailAdapter();
  }

  /**
   * Send a single message
   */
  async sendMessage(input: SendMessageInput) {
    // Get credit cost for channel
    const creditCost = this.getChannelCreditCost(input.channel);

    // Check credits
    const hasCredits = await this.creditService.hasSufficientCredits(
      input.userId,
      creditCost
    );

    if (!hasCredits) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await this.creditService.deductCredits({
      userId: input.userId,
      tenantId: input.tenantId,
      amount: creditCost,
      description: `${input.channel} message to lead ${input.leadId}`,
      relatedEntityType: 'OUTREACH',
      relatedEntityId: input.leadId,
    });

    // Create message record
    const message = await prisma.outreachMessage.create({
      data: {
        userId: input.userId,
        tenantId: input.tenantId,
        leadId: input.leadId,
        campaignId: input.campaignId,
        templateId: input.templateId,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        status: 'QUEUED',
        creditsUsed: creditCost,
      },
    });

    if (this.outreachQueue) {
      await this.outreachQueue.add(
        'send-message',
        {
          messageId: message.id,
          leadId: input.leadId,
          channel: input.channel,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        }
      );
    }

    return message;
  }

  /**
   * Send messages in batch
   */
  async sendBatch(input: BatchSendInput) {
    const creditCost = this.getChannelCreditCost(input.channel);
    const totalCost = creditCost * input.leadIds.length;

    // Check credits
    const hasCredits = await this.creditService.hasSufficientCredits(
      input.userId,
      totalCost
    );

    if (!hasCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }

    // Get leads
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: input.leadIds },
        userId: input.userId,
      },
      include: {
        enrichment: true,
      },
    });

    // Create messages and queue
    const messages = await Promise.all(
      leads.map(async (lead) => {
        // Personalize message if enrichment exists
        let body = input.body;
        if (input.personalize && lead.enrichment) {
          body = this.personalizeMessage(input.body, lead, lead.enrichment);
        }

        // Deduct credits
        await this.creditService.deductCredits({
          userId: input.userId,
          tenantId: input.tenantId,
          amount: creditCost,
          description: `${input.channel} message to lead ${lead.id}`,
          relatedEntityType: 'OUTREACH',
          relatedEntityId: lead.id,
        });

        // Create message
        const message = await prisma.outreachMessage.create({
          data: {
            userId: input.userId,
            tenantId: input.tenantId,
            leadId: lead.id,
            campaignId: input.campaignId,
            templateId: input.templateId,
            channel: input.channel,
            subject: input.subject,
            body: input.body,
            bodyPersonalized: body,
            status: 'QUEUED',
            creditsUsed: creditCost,
          },
        });

        if (this.outreachQueue) {
          await this.outreachQueue.add(
            'send-message',
            {
              messageId: message.id,
              leadId: lead.id,
              channel: input.channel,
            },
            {
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            }
          );
        }

        return message;
      })
    );

    // Update campaign contacted count
    if (input.campaignId) {
      await prisma.campaign.update({
        where: { id: input.campaignId },
        data: { contactedCount: { increment: messages.length } },
      });
    }

    return {
      queued: messages.length,
      totalCredits: totalCost,
      messages,
    };
  }

  /**
   * Process a queued message (called by worker)
   */
  async processMessage(messageId: string): Promise<boolean> {
    const message = await prisma.outreachMessage.findUnique({
      where: { id: messageId },
      include: { lead: true },
    });

    if (!message || !message.lead) {
      throw new Error('Message or lead not found');
    }

    // Update status to sending
    await prisma.outreachMessage.update({
      where: { id: messageId },
      data: { status: 'SENDING' },
    });

    try {
      let result: { success: boolean; externalId?: string; error?: string };

      switch (message.channel) {
        case 'WHATSAPP':
          result = await this.whatsappAdapter.send({
            to: message.lead.mobile || message.lead.phone!,
            body: message.bodyPersonalized || message.body,
          });
          break;

        case 'SMS':
          result = await this.smsAdapter.send({
            to: message.lead.mobile || message.lead.phone!,
            body: message.bodyPersonalized || message.body,
          });
          break;

        case 'EMAIL':
          result = await this.emailAdapter.send({
            to: message.lead.email!,
            subject: message.subject!,
            body: message.bodyPersonalized || message.body,
          });
          break;

        default:
          throw new Error(`Unsupported channel: ${message.channel}`);
      }

      if (result.success) {
        await prisma.outreachMessage.update({
          where: { id: messageId },
          data: {
            status: 'SENT',
            externalId: result.externalId,
            sentAt: new Date(),
          },
        });

        // Update lead status
        await prisma.lead.update({
          where: { id: message.leadId },
          data: { status: 'CONTACTED' },
        });

        return true;
      } else {
        throw new Error(result.error || 'Send failed');
      }
    } catch (error) {
      console.error('Outreach send failed:', error);

      await prisma.outreachMessage.update({
        where: { id: messageId },
        data: {
          status: 'FAILED',
        },
      });

      // Refund credits on failure
      await this.creditService.refundCredits({
        userId: message.userId,
        tenantId: message.tenantId,
        amount: message.creditsUsed,
        description: `Refund for failed ${message.channel} message`,
      });

      return false;
    }
  }

  /**
   * Get message statistics
   */
  async getMessageStats(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const stats = await prisma.outreachMessage.groupBy({
      by: ['channel', 'status'],
      where: {
        userId,
        createdAt: { gte: since },
      },
      _count: true,
    });

    return stats;
  }

  /**
   * Get credit cost for channel
   */
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

  /**
   * Personalize message with enrichment data
   */
  private personalizeMessage(
    template: string,
    lead: any,
    enrichment: any
  ): string {
    let message = template;

    // Basic replacements
    message = message.replace(/\{\{firstName\}\}/g, lead.firstName || '');
    message = message.replace(/\{\{lastName\}\}/g, lead.lastName || '');
    message = message.replace(/\{\{company\}\}/g, lead.companyName || '');
    message = message.replace(/\{\{jobTitle\}\}/g, lead.jobTitle || '');

    // Enrichment-based replacements
    if (enrichment) {
      message = message.replace(
        /\{\{painPoint\}\}/g,
        enrichment.painPoints?.[0] || ''
      );
      message = message.replace(
        /\{\{opportunity\}\}/g,
        enrichment.opportunities?.[0] || ''
      );
      message = message.replace(
        /\{\{conversationStarter\}\}/g,
        enrichment.conversationStarters?.[0] || ''
      );
    }

    return message;
  }
}
