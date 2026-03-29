const logger = require('./logger');
const axios = require('axios');

const brevoApiKey = String(process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '')
  .trim()
  .replace(/^['\"]|['\"]$/g, '');
const fromEmail = process.env.SMTP_FROM || 'noreply@babcock-marketplace.com';
const EMAIL_TIMEOUT = Number(process.env.EMAIL_TIMEOUT || 10000); // 10 seconds

const maskKey = (value) => {
  if (!value) return 'missing';
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
};

if (brevoApiKey) {
  logger.info('Brevo key loaded', {
    source: process.env.BREVO_API_KEY ? 'BREVO_API_KEY' : 'SENDINBLUE_API_KEY',
    masked: maskKey(brevoApiKey),
    length: brevoApiKey.length,
  });
} else {
  logger.warn('Brevo key missing: set BREVO_API_KEY (or legacy SENDINBLUE_API_KEY)');
}

const sendEmail = async ({ to, subject, text }) => {
  if (!to || !subject) {
    logger.warn('Email validation failed', { reason: 'missing-recipient-or-subject' });
    return { sent: false, reason: 'missing-recipient-or-subject' };
  }

  if (!brevoApiKey) {
    logger.info('Email queued (Brevo not configured)', { 
      to, 
      subject, 
      preview: text?.slice(0, 120) 
    });
    return { sent: true, fallback: true };
  }

  try {
    // Call Brevo API directly to avoid SDK/runtime export mismatches.
    const emailPromise = axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: to }],
      sender: { email: fromEmail, name: 'Babcock Marketplace' },
      subject,
      textContent: text,
    }, {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      timeout: EMAIL_TIMEOUT,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), EMAIL_TIMEOUT)
    );

    await Promise.race([emailPromise, timeoutPromise]);

    logger.info('Email sent via Brevo', { to, subject });
    return { sent: true, fallback: false };
  } catch (error) {
    const status = error?.response?.status;
    const responseBody = error?.response?.data;

    logger.error('Email send failed', { 
      to, 
      subject, 
      error: error.message,
      status,
      responseBody,
      keyHint: maskKey(brevoApiKey),
      timeout: EMAIL_TIMEOUT 
    });
    
    // Return failure so we can track, but don't crash the request
    return { sent: false, queued: true, error: error.message };
  }
};

module.exports = {
  sendEmail,
};
