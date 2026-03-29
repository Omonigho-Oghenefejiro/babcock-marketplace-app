import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const notificationServicePath = require.resolve('./notificationService.js');

const loadNotificationService = () => {
  delete require.cache[notificationServicePath];
  return require('./notificationService.js') as {
    sendEmail: (payload: { to?: string; subject?: string; text?: string }) => Promise<any>;
  };
};

describe('server notificationService utils', () => {
  let logger: any;
  let axios: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.BREVO_API_KEY;
    delete process.env.SENDINBLUE_API_KEY;
    logger = require('./logger.js');
    axios = require('axios');
  });

  afterEach(() => {
    delete process.env.BREVO_API_KEY;
    delete process.env.SENDINBLUE_API_KEY;
    vi.restoreAllMocks();
  });

  it('returns validation result when recipient or subject is missing', async () => {
    const notificationService = loadNotificationService();

    const result1 = await notificationService.sendEmail({ to: '', subject: 'Hello', text: 'Body' });
    expect(result1).toEqual({
      sent: false,
      reason: 'missing-recipient-or-subject',
    });

    const result2 = await notificationService.sendEmail({ to: 'admin@babcock.edu.ng', subject: '', text: 'Body' });
    expect(result2).toEqual({
      sent: false,
      reason: 'missing-recipient-or-subject',
    });
  });

  it('uses fallback logging when Brevo API is not configured', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const notificationService = loadNotificationService();

    const result = await notificationService.sendEmail({
      to: 'admin@babcock.edu.ng',
      subject: 'Daily digest',
      text: 'Summary body here',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      'Email queued (Brevo not configured)',
      expect.objectContaining({ to: 'admin@babcock.edu.ng', subject: 'Daily digest', preview: 'Summary body here' })
    );
    expect(result).toEqual({ sent: true, fallback: true });
  });
});