"use server";

import { headers } from "next/headers";

import { sendInquiryAlert } from "@/lib/mailer";
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
 * persist, and only then notify. Persistence is the commitment — once the row is
 * in Supabase the lead is safe in the admin inbox at /admin/inbox, so a mail
 * failure costs a notification, never a lead. The reverse also holds: if the
 * write fails, the email is attempted anyway as a last line of defence.
 *
 * No third-party mail provider is involved — delivery is SMTP through the
 * studio's own mailbox. See `src/lib/mailer.ts`.
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

  const notification = {
    name: values.name,
    email: values.email,
    company: values.company,
    budget: values.budget,
    message: values.message,
  };

  const { error } = await supabaseServer.from("inquiries").insert({
    name: values.name,
    email: values.email,
    message: messageParts.join("\n"),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[inquiry] failed to persist:", error.code, error.message);

    // 42501 is a row-level security refusal, and it is the failure this app is
    // most likely to hit: RLS is on for `inquiries` but the anon role has no
    // insert policy, so every submission is silently rejected and the inbox
    // stays empty. Call it out by name rather than leaving a bare Postgres code
    // in the log — the fix is one script, not a debugging session.
    if (error.code === "42501") {
      console.error(
        "[inquiry] the anon role is not allowed to insert into `inquiries`. " +
          "Run supabase/inquiries.sql in the Supabase SQL editor to install the " +
          "row-level security policies.",
      );
    }

    // Last line of defence. The database is the intended record, but an emailed
    // inquiry is not a lost one — so try to get it out by mail before admitting
    // failure, flagged so it can't be mistaken for a copy of an inbox entry.
    // Only if that fails too does the visitor get sent away to email manually.
    const emailed = await sendInquiryAlert(notification, { persisted: false });

    if (emailed) {
      console.warn(
        "[inquiry] not saved, but delivered by email — the lead is recoverable.",
      );
      return { ok: true };
    }

    return {
      ok: false,
      error:
        "Something went wrong on our end and your message wasn't saved. " +
        "Please email us directly so it doesn't get lost.",
    };
  }

  // Emails you from your own mailbox over SMTP. Awaited rather than fired and
  // forgotten: a serverless function can be frozen the moment the response is
  // returned, which would kill an in-flight connection. `sendInquiryAlert` never
  // throws and carries its own timeouts, so this cannot fail or hang the form.
  await sendInquiryAlert(notification);

  return { ok: true };
}
