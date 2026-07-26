import { siteName } from "@/lib/site";

/**
 * Composes the human-readable form of an inquiry.
 *
 * Kept separate from the transport in `src/lib/mailer.ts` so the wording of a
 * notification is decided in one place regardless of how it is delivered.
 */

export interface InquiryNotification {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

/**
 * Subject line. Leads with the sender's name and company because that is what
 * makes an inbox list scannable — the fact that it's a website inquiry is
 * already obvious from the rest of the line.
 */
export function inquirySubject(inquiry: InquiryNotification): string {
  return `New message on your portfolio — ${inquiry.name}${
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
