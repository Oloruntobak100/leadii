/**
 * WhatsApp delivery adapter (stub — wire Twilio/Meta in production).
 */
export class WhatsAppAdapter {
  async send(_input: {
    to: string;
    body: string;
  }): Promise<{ success: boolean; externalId?: string; error?: string }> {
    return {
      success: false,
      error: 'WhatsApp adapter not configured',
    };
  }
}
