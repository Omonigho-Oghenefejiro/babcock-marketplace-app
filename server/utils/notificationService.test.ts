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

  it('logs key metadata at startup when Brevo API key is configured', () => {
    process.env.BREVO_API_KEY = 'abcd1234wxyz5678';
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    loadNotificationService();

    expect(infoSpy).toHaveBeenCalledWith(
      'Brevo key loaded',
      expect.objectContaining({
        source: 'BREVO_API_KEY',
        masked: 'abcd***5678',
        length: 16,
      })
    );
  });

  it('sends email through Brevo when configured', async () => {
    process.env.BREVO_API_KEY = 'abcd1234wxyz5678';
    process.env.SMTP_FROM = 'no-reply@babcock.edu.ng';
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: { messageId: '1' } });

    const notificationService = loadNotificationService();
    const result = await notificationService.sendEmail({
      to: 'admin@babcock.edu.ng',
      subject: 'Summary',
      text: 'Daily summary body',
    });

    expect(postSpy).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        to: [{ email: 'admin@babcock.edu.ng' }],
        sender: { email: 'no-reply@babcock.edu.ng', name: 'Babcock Marketplace' },
        subject: 'Summary',
        textContent: 'Daily summary body',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({ 'api-key': 'abcd1234wxyz5678' }),
      })
    );
    expect(infoSpy).toHaveBeenCalledWith('Email sent via Brevo', {
      to: 'admin@babcock.edu.ng',
      subject: 'Summary',
    });
    expect(result).toEqual({ sent: true, fallback: false });
  });

  it('returns queued failure details when Brevo API call fails', async () => {
    process.env.BREVO_API_KEY = 'abcd1234wxyz5678';
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    vi.spyOn(axios, 'post').mockRejectedValue({
      message: 'Request failed with status code 401',
      response: { status: 401, data: { code: 'invalid_api_key' } },
    });

    const notificationService = loadNotificationService();
    const result = await notificationService.sendEmail({
      to: 'admin@babcock.edu.ng',
      subject: 'Summary',
      text: 'Daily summary body',
    });

    expect(errorSpy).toHaveBeenCalledWith(
      'Email send failed',
      expect.objectContaining({
        to: 'admin@babcock.edu.ng',
        subject: 'Summary',
        status: 401,
        keyHint: 'abcd***5678',
      })
    );
    expect(result).toEqual({
      sent: false,
      queued: true,
      error: 'Request failed with status code 401',
    });
  });
});