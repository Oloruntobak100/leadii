/**
 * Email delivery adapter (stub — wire Resend/SendGrid in production).
 */
export class EmailAdapter {
  async send(_input: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean; externalId?: string; error?: string }> {
    return {
      success: false,
      error: 'Email adapter not configured',
    };
  }
}
