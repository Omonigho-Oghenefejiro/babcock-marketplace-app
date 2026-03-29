const logger = require('./logger');
const { BrevoClient } = require('@getbrevo/brevo');

const brevoApiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.SMTP_FROM || 'noreply@babcock-marketplace.com';
const EMAIL_TIMEOUT = Number(process.env.EMAIL_TIMEOUT || 10000); // 10 seconds

// Initialize Brevo API client if key is provided
let apiClient = null;
if (brevoApiKey) {
  try {
    apiClient = new BrevoClient({ apiKey: brevoApiKey });
  } catch (error) {
    logger.error('Brevo client initialization failed', { error: error.message });
    apiClient = null;
  }
}

const sendEmail = async ({ to, subject, text }) => {
  if (!to || !subject) {
    logger.warn('Email validation failed', { reason: 'missing-recipient-or-subject' });
    return { sent: false, reason: 'missing-recipient-or-subject' };
  }

  if (!apiClient) {
    logger.info('Email queued (Brevo not configured)', { 
      to, 
      subject, 
      preview: text?.slice(0, 120) 
    });
    return { sent: true, fallback: true };
  }

  try {
    // Enforce timeout using Promise.race
    const emailPromise = apiClient.transactionalEmails.sendTransacEmail({
      to: [{ email: to }],
      sender: { email: fromEmail, name: 'Babcock Marketplace' },
      subject,
      textContent: text,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), EMAIL_TIMEOUT)
    );

    await Promise.race([emailPromise, timeoutPromise]);

    logger.info('Email sent via Brevo', { to, subject });
    return { sent: true, fallback: false };
  } catch (error) {
    logger.error('Email send failed', { 
      to, 
      subject, 
      error: error.message,
      timeout: EMAIL_TIMEOUT 
    });
    
    // Return failure so we can track, but don't crash the request
    return { sent: false, queued: true, error: error.message };
  }
};

module.exports = {
  sendEmail,
};
