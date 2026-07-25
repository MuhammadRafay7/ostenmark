import { siteName } from "@/lib/site";

/**
 * Outbound notification for a new inquiry.
 *
 * The previous flow had no server-side delivery at all: after inserting the row
 * it set `window.location.href = "mailto:…"`, which navigated the visitor away
 * from the site into their own mail client with a pre-filled draft they then had
 * to send themselves. On a machine with no mail client configured, nothing
 * happened at all — and the UI reported success either way.
 *
 * Delivery is now server-side and, critically, *non-fatal*: the inquiry is
 * already persisted in Supabase and visible in the admin inbox before this runs,
 * so a mail outage costs a notification, never a lead.
 *
 * Uses Resend's HTTP API directly rather than an SDK — one fetch call, no
 * dependency. Set `RESEND_API_KEY` and `INQUIRY_NOTIFY_TO` to enable it; without
 * them this logs and returns, which is the correct behaviour for local
 * development.
 */

interface InquiryNotification {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

export async function notifyNewInquiry(
  inquiry: InquiryNotification,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_TO;
  // Must be a domain verified with the provider; falls back to Resend's
  // always-available onboarding sender so a partial config still delivers.
  const from = process.env.INQUIRY_NOTIFY_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.warn(
      "[notify] RESEND_API_KEY or INQUIRY_NOTIFY_TO not set — " +
        "inquiry stored but no email sent. Check the admin inbox at /admin/inbox.",
    );
    return;
  }

  const lines = [
    `Name:    ${inquiry.name}`,
    `Email:   ${inquiry.email}`,
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.budget ? `Budget:  ${inquiry.budget}` : null,
    "",
    inquiry.message,
  ].filter((line): line is string => line !== null);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${siteName} <${from}>`,
        to: [to],
        // Lets the recipient reply straight to the prospect from their inbox.
        reply_to: inquiry.email,
        subject: `New inquiry — ${inquiry.name}${
          inquiry.company ? ` (${inquiry.company})` : ""
        }`,
        text: lines.join("\n"),
      }),
      // Don't let a hanging provider hold the visitor's request open.
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      console.error(
        "[notify] provider rejected the message:",
        response.status,
        await response.text().catch(() => ""),
      );
    }
  } catch (error) {
    console.error("[notify] failed to send inquiry notification:", error);
  }
}
