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

const clearSmtpEnv = () => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;
};

describe('server notificationService utils', () => {
  let logger: any;
  let nodemailer: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    clearSmtpEnv();
    logger = require('./logger.js');
    nodemailer = require('nodemailer');
  });

  afterEach(() => {
    clearSmtpEnv();
    vi.restoreAllMocks();
  });

  it('returns validation result when recipient or subject is missing', async () => {
    const notificationService = loadNotificationService();

    await expect(notificationService.sendEmail({ to: '', subject: 'Hello', text: 'Body' })).resolves.toEqual({
      sent: false,
      reason: 'missing-recipient-or-subject',
    });

    await expect(notificationService.sendEmail({ to: 'admin@babcock.edu.ng', subject: '', text: 'Body' })).resolves.toEqual({
      sent: false,
      reason: 'missing-recipient-or-subject',
    });
  });

  it('uses fallback logging when SMTP transport is not configured', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const createTransportSpy = vi.spyOn(nodemailer, 'createTransport');
    const notificationService = loadNotificationService();

    const result = await notificationService.sendEmail({
      to: 'admin@babcock.edu.ng',
      subject: 'Daily digest',
      text: 'Summary body here',
    });

    expect(createTransportSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      'Email notification queued (fallback)',
      expect.objectContaining({ to: 'admin@babcock.edu.ng', subject: 'Daily digest' })
    );
    expect(result).toEqual({ sent: true, fallback: true });
  });

  it('sends email via SMTP transporter when credentials are available', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASS = 'smtp-secret';
    process.env.SMTP_FROM = 'no-reply@example.com';

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-1' });
    const createTransportSpy = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail: sendMailMock } as any);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    const notificationService = loadNotificationService();

    expect(createTransportSpy).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mailer@example.com',
        pass: 'smtp-secret',
      },
    });

    const result = await notificationService.sendEmail({
      to: 'buyer@babcock.edu.ng',
      subject: 'Order update',
      text: 'Your order has shipped.',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'buyer@babcock.edu.ng',
      subject: 'Order update',
      text: 'Your order has shipped.',
    });
    expect(infoSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ sent: true, fallback: false });
  });
});