/**
 * SMS delivery adapter (stub — wire Twilio in production).
 */
export class SMSAdapter {
  async send(_input: {
    to: string;
    body: string;
  }): Promise<{ success: boolean; externalId?: string; error?: string }> {
    return {
      success: false,
      error: 'SMS adapter not configured',
    };
  }
}
