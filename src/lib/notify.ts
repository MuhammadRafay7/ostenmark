import { siteName } from "@/lib/site";

/**
 * Builds the `mailto:` draft handed back to the visitor after an inquiry is
 * saved.
 *
 * There is deliberately no third-party mail provider here. Delivery has two
 * independent legs, neither of which depends on an external service:
 *
 *   1. The inquiry row in Supabase — this is the record of truth, written
 *      before anything else happens, and it is what /admin/inbox reads.
 *   2. This draft, opened in the visitor's own mail client, so a copy also
 *      lands in the studio inbox without an API key.
 *
 * Leg 2 is best-effort by design: a machine with no mail client configured will
 * do nothing when the link is opened, and that is fine — the lead is already
 * safe in the admin inbox, and the success screen exposes the same link so it
 * can be clicked manually.
 */

export interface InquiryNotification {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

/** Subject line, shared by the draft and any future channel. */
export function inquirySubject(inquiry: InquiryNotification): string {
  return `New inquiry — ${inquiry.name}${
    inquiry.company ? ` (${inquiry.company})` : ""
  }`;
}

/** Plain-text body: the submitted fields, in the order they were asked for. */
export function inquiryBody(inquiry: InquiryNotification): string {
  return [
    `Name:    ${inquiry.name}`,
    `Email:   ${inquiry.email}`,
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.budget ? `Budget:  ${inquiry.budget}` : null,
    "",
    inquiry.message,
    "",
    "—",
    `Sent from the ${siteName} contact form.`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/**
 * Composes the full `mailto:` URL.
 *
 * `encodeURIComponent` rather than `URLSearchParams`: the latter encodes spaces
 * as `+`, which several mail clients render literally in a subject line.
 * `reply-to` is set to the sender so replying from the studio inbox goes to the
 * prospect, not back to the studio.
 */
export function inquiryMailto(
  inquiry: InquiryNotification,
  recipient: string,
): string {
  const params = [
    `subject=${encodeURIComponent(inquirySubject(inquiry))}`,
    `body=${encodeURIComponent(inquiryBody(inquiry))}`,
    `reply-to=${encodeURIComponent(inquiry.email)}`,
  ].join("&");

  return `mailto:${recipient.trim()}?${params}`;
}
