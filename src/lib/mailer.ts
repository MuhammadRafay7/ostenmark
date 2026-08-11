import nodemailer from "nodemailer";

import {
  inquiryBody,
  inquirySubject,
  type InquiryNotification,
} from "@/lib/notify";
import { siteName, siteUrl } from "@/lib/site";

/**
 * Sends the "you have a new message" alert to the studio's own inbox.
 *
 * Deliberately SMTP against *your own mailbox* rather than a delivery provider:
 * no Resend/SendGrid/Postmark account, no API key belonging to a third party, no
 * vendor holding your lead data. The trade-off is that mail is sent as you, from
 * your address, subject to your provider's sending limits — which for a contact
 * form receiving a handful of inquiries a day is not a real constraint.
 *
 * Gmail needs an **app password**, not your account password: Google Account →
 * Security → 2-Step Verification → App passwords. The normal password will be
 * rejected. See `.env.example` for the settings for common providers.
 *
 * Every failure here is swallowed after logging. The inquiry is already in
 * Supabase and visible at /admin/inbox before this runs, so a mail outage,
 * a rotated password or a provider rate-limit costs a notification, never a lead.
 */

/** Reads SMTP config, returning null when it isn't configured. */
function readConfig(recipient?: string | null) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // Where the alert lands. The caller passes the address configured at
  // /admin/footer; `INQUIRY_NOTIFY_TO` covers a deploy whose CMS row has no
  // address yet, and the sending mailbox is the last resort — the common case
  // being that you notify yourself at the address you send from.
  const to = recipient?.trim() || process.env.INQUIRY_NOTIFY_TO || user;

  if (!host || !user || !pass || !to) return null;

  // 465 is implicit TLS; anything else (587, 25) starts plaintext and upgrades
  // via STARTTLS, which is what `secure: false` means to nodemailer here.
  const port = Number(process.env.SMTP_PORT ?? 465);

  return { host, port, user, pass, to, secure: port === 465 };
}

/**
 * Notifies the studio of a new inquiry.
 *
 * Never rejects. Returns whether the message was actually handed to the SMTP
 * server, which the caller uses to decide what to tell the visitor when the
 * database write failed — an emailed inquiry is not a lost one, even if it
 * never reached the admin inbox.
 *
 * `persisted: false` marks the email as the *only* surviving copy, so it can be
 * treated accordingly rather than being read as a duplicate of an inbox entry.
 *
 * `to` is the address configured at /admin/footer, resolved by the caller so
 * this module stays pure transport. Omitted or blank falls back to the env
 * settings described in `readConfig`.
 */
export async function sendInquiryAlert(
  inquiry: InquiryNotification,
  { persisted = true, to }: { persisted?: boolean; to?: string | null } = {},
): Promise<boolean> {
  const config = readConfig(to);

  if (!config) {
    console.warn(
      "[mailer] SMTP_HOST / SMTP_USER / SMTP_PASS not set — inquiry saved but " +
        "no email sent. It is in the admin inbox at /admin/inbox. " +
        "See .env.example to enable email alerts.",
    );
    return false;
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // A contact form must not hold the visitor's request open on a slow relay.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  // A failed save is an exception worth shouting about in the subject line:
  // this email is then the only record of the lead.
  const subject = persisted
    ? inquirySubject(inquiry)
    : `[ACTION NEEDED — not saved] ${inquirySubject(inquiry)}`;

  const footer = persisted
    ? `Read and reply in the admin inbox:\n${siteUrl}/admin/inbox`
    : "WARNING: this inquiry could NOT be saved to the database, so it will " +
      "not appear in the admin inbox. This email is the only copy — reply to " +
      "it directly.";

  try {
    await transport.sendMail({
      // The envelope sender must be the authenticated mailbox or the provider
      // will reject it; the display name is what carries the branding.
      from: `${siteName} website <${config.user}>`,
      to: config.to,
      // Hitting reply in your mail client writes to the prospect, not to
      // yourself — the single most useful thing this email can do.
      replyTo: `${inquiry.name} <${inquiry.email}>`,
      subject,
      // Sets X-Priority / Importance headers. Gmail weighs these when deciding
      // what counts as "high priority", which is the default filter for mobile
      // notifications — without it, an alert you sent to yourself is easily
      // demoted to no-notification.
      priority: "high",
      headers: {
        // Marks the message as machine-generated. Keeps it out of the
        // conversation Gmail would otherwise thread with your own sent mail.
        "Auto-Submitted": "auto-generated",
      },
      text: `${inquiryBody(inquiry)}\n\n${footer}`,
      html: renderHtml(inquiry, persisted),
    });
    return true;
  } catch (error) {
    console.error("[mailer] could not send the inquiry alert:", error);
    return false;
  } finally {
    transport.close();
  }
}

/**
 * HTML body.
 *
 * Table-free, inline-styled and deliberately plain: this is a notification read
 * on a phone in ten seconds, so it optimises for the sender's details being
 * scannable and the reply path being obvious. `text` above carries the same
 * content for clients with HTML disabled.
 */
function renderHtml(inquiry: InquiryNotification, persisted: boolean): string {
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    inquiry.company ? ["Company", inquiry.company] : null,
    inquiry.budget ? ["Budget", inquiry.budget] : null,
  ].filter((row): row is [string, string] => row !== null);

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#111;max-width:560px">
  ${
    persisted
      ? `<p style="font-size:15px;margin:0 0 20px">You have a new message from the ${escapeHtml(siteName)} contact form.</p>`
      : `<p style="font-size:15px;margin:0 0 20px;padding:12px 14px;background:#fdeaea;border-left:3px solid #c0392b"><strong>This inquiry could not be saved</strong> and will not appear in the admin inbox. This email is the only copy — reply to it directly.</p>`
  }
  <dl style="margin:0 0 20px;font-size:14px">
    ${rows
      .map(
        ([label, value]) =>
          `<dt style="color:#666;font-size:12px;margin-top:10px">${escapeHtml(label)}</dt>` +
          `<dd style="margin:2px 0 0;font-weight:600">${escapeHtml(value)}</dd>`,
      )
      .join("")}
  </dl>
  <div style="border-left:3px solid #ddd;padding-left:14px;margin:0 0 22px;white-space:pre-wrap;font-size:14px">${escapeHtml(
    inquiry.message,
  )}</div>
  <p style="margin:0;font-size:14px">
    ${
      persisted
        ? `<a href="${siteUrl}/admin/inbox" style="color:#1f47e0">Open the admin inbox</a>&nbsp;·&nbsp;`
        : ""
    }<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#1f47e0">Reply to ${escapeHtml(inquiry.name)}</a>
  </p>
</div>`.trim();
}

/**
 * Escapes submitted text before it goes into the HTML body.
 *
 * The message field is attacker-controlled free text arriving from a public
 * form. Interpolating it raw would let a submitter inject markup or a link into
 * an email you trust and are about to read.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
