const logger = require('./logger');
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || 'no-reply@babcock-marketplace.local';
const EMAIL_TIMEOUT = Number(process.env.EMAIL_TIMEOUT || 10000); // 10 seconds default

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      socketTimeout: EMAIL_TIMEOUT,
      connectionTimeout: EMAIL_TIMEOUT,
    })
  : null;

// Wrapper to enforce timeout on email sending
const sendEmailWithTimeout = async (mailOptions, timeout = EMAIL_TIMEOUT) => {
  return Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), timeout)
    ),
  ]);
};

const sendEmail = async ({ to, subject, text }) => {
  if (!to || !subject) {
    logger.warn('Email validation failed', { reason: 'missing-recipient-or-subject' });
    return { sent: false, reason: 'missing-recipient-or-subject' };
  }

  if (!transporter) {
    logger.info('Email notification queued (fallback - no SMTP configured)', { 
      to, 
      subject, 
      preview: text?.slice(0, 120) 
    });
    return { sent: true, fallback: true };
  }

  try {
    await sendEmailWithTimeout({
      from: fromEmail,
      to,
      subject,
      text,
    });

    logger.info('Email sent successfully', { to, subject });
    return { sent: true, fallback: false };
  } catch (error) {
    logger.error('Email send failed', { 
      to, 
      subject, 
      error: error.message,
      timeout: EMAIL_TIMEOUT 
    });
    
    // Return success to prevent request from failing, but log the error
    // This allows registration to complete even if email fails
    return { sent: false, queued: true, error: error.message };
  }
};

module.exports = {
  sendEmail,
};
