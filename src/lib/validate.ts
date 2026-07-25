/**
 * Minimal field validation for the inquiry form.
 *
 * Hand-rolled rather than pulling in a schema library: this is the only form on
 * the site, the rules are five lines each, and the validation has to run
 * identically on the server (authoritative) and be describable to the client.
 *
 * The server is the only place that decides whether input is acceptable. Browser
 * `required`/`type="email"` attributes are a convenience for the visitor, never
 * a check — the previous implementation relied on them entirely and inserted
 * straight into the database from the browser.
 */

export interface FieldRule {
  label: string;
  required?: boolean;
  min?: number;
  max: number;
  /** Additional check; returns an error message or null. */
  check?: (value: string) => string | null;
}

// Deliberately permissive: the goal is to reject obvious typos and junk, not to
// implement RFC 5322. Anything that passes gets a real delivery attempt anyway.
const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;.]+(?:\.[^\s@,;.]+)+$/;

export const inquiryRules = {
  name: { label: "Name", required: true, min: 2, max: 120 },
  email: {
    label: "Email",
    required: true,
    min: 5,
    max: 200,
    check: (value) =>
      EMAIL_PATTERN.test(value) ? null : "Enter a valid email address.",
  },
  company: { label: "Company", max: 160 },
  budget: { label: "Budget", max: 60 },
  message: {
    label: "Project details",
    required: true,
    min: 20,
    max: 4000,
  },
} satisfies Record<string, FieldRule>;

export type InquiryField = keyof typeof inquiryRules;

export interface ValidationOutcome {
  values: Record<InquiryField, string>;
  errors: Partial<Record<InquiryField, string>>;
}

/**
 * Strips control characters that would corrupt a plain-text email body or a log
 * line. Tab and newline are deliberately preserved — the message field is
 * legitimately multi-line.
 */
function clean(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function validateInquiry(formData: FormData): ValidationOutcome {
  const values = {} as Record<InquiryField, string>;
  const errors: Partial<Record<InquiryField, string>> = {};

  for (const [field, rule] of Object.entries(inquiryRules) as Array<
    [InquiryField, FieldRule]
  >) {
    const value = clean(formData.get(field));
    values[field] = value;

    if (!value) {
      if (rule.required) errors[field] = `${rule.label} is required.`;
      continue;
    }
    if (rule.min && value.length < rule.min) {
      errors[field] = `${rule.label} must be at least ${rule.min} characters.`;
      continue;
    }
    if (value.length > rule.max) {
      errors[field] = `${rule.label} must be ${rule.max} characters or fewer.`;
      continue;
    }
    const custom = rule.check?.(value);
    if (custom) errors[field] = custom;
  }

  return { values, errors };
}
