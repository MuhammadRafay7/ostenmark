"use server";

import { headers } from "next/headers";

import { getSiteSettings } from "@/lib/content";
import { inquiryMailto } from "@/lib/notify";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { supabaseServer } from "@/lib/supabase/server";
import type { InquiryResult } from "@/lib/types";
import { validateInquiry } from "@/lib/validate";

/**
 * Handles an inquiry submission.
 *
 * Replaces a browser-side `supabase.insert()` followed by a `mailto:` redirect.
 * That old path had no server-side validation, no abuse protection, reported
 * success regardless of what actually happened, and navigated the visitor off the
 * site to finish sending the message themselves.
 *
 * Order of operations matters here: validate, then screen for abuse, then
 * persist, and only then hand back a notification draft. Persistence is the
 * commitment — once the row is in Supabase the lead is safe in the admin inbox
 * at /admin/inbox, so the email leg can fail without costing the lead.
 *
 * No third-party mail provider is involved: the returned `mailto` is opened by
 * the browser in the visitor's own mail client, which puts a copy in the studio
 * inbox with zero external dependencies. See `src/lib/notify.ts`.
 */
export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  const { values, errors } = validateInquiry(formData);

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: errors,
    };
  }

  // Honeypot: a field hidden from humans but not from naive form-filling bots.
  // Answered means automated, so accept silently — telling a bot it was detected
  // only helps whoever is tuning it.
  if (typeof formData.get("website") === "string" && formData.get("website")) {
    return { ok: true };
  }

  const requestHeaders = await headers();
  const limit = rateLimit(`inquiry:${clientKey(requestHeaders)}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfter / 60));
    return {
      ok: false,
      error: `Too many submissions. Please try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }, or email us directly.`,
    };
  }

  // Guards against double-submits from an impatient click or a retried request.
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: recent } = await supabaseServer
    .from("inquiries")
    .select("id")
    .eq("email", values.email)
    .gte("created_at", since)
    .limit(1);

  if (recent && recent.length > 0) {
    return { ok: true };
  }

  // `company` and `budget` are new fields with no columns of their own; fold them
  // into the message so the existing admin inbox renders them without a
  // migration. See the CMS contract note in the project memory.
  const messageParts = [
    values.company ? `Company: ${values.company}` : null,
    values.budget ? `Budget: ${values.budget}` : null,
    values.company || values.budget ? "" : null,
    values.message,
  ].filter((part): part is string => part !== null);

  const { error } = await supabaseServer.from("inquiries").insert({
    name: values.name,
    email: values.email,
    message: messageParts.join("\n"),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[inquiry] failed to persist:", error.message);
    return {
      ok: false,
      error:
        "Something went wrong on our end and your message wasn't saved. " +
        "Please email us directly so it doesn't get lost.",
    };
  }

  // The recipient is the studio's own contact address, resolved server-side from
  // the CMS so it stays in step with /admin/footer rather than being hardcoded
  // or trusted from the client.
  let mailto: string | undefined;
  try {
    const { contact } = await getSiteSettings();
    mailto = inquiryMailto(
      {
        name: values.name,
        email: values.email,
        company: values.company,
        budget: values.budget,
        message: values.message,
      },
      contact.email,
    );
  } catch (error) {
    // Non-fatal: the inquiry is already stored and visible in the admin inbox.
    console.error("[inquiry] could not build notification draft:", error);
  }

  return { ok: true, mailto };
}
