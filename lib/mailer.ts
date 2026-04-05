import nodemailer from "nodemailer";

/**
 * Shared nodemailer transport for SMTP sends.
 *
 * Configured via env vars:
 *   SMTP_HOST    - e.g. gvam1193.siteground.biz
 *   SMTP_PORT    - 465 (SSL) or 587 (STARTTLS)
 *   SMTP_SECURE  - "true" for 465, "false" for 587 (defaults to true)
 *   SMTP_USER    - full mailbox address (also used as the authenticated FROM)
 *   SMTP_PASS    - mailbox password
 */
export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
