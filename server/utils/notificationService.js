const logger = require('./logger');
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || 'no-reply@babcock-marketplace.local';

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

const sendEmail = async ({ to, subject, text }) => {
  if (!to || !subject) {
    return { sent: false, reason: 'missing-recipient-or-subject' };
  }

  if (!transporter) {
    logger.info('Email notification queued (fallback)', { to, subject, preview: text?.slice(0, 120) });
    return { sent: true, fallback: true };
  }

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
  });

  return { sent: true, fallback: false };
};

module.exports = {
  sendEmail,
};
