"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";

import { submitInquiry } from "@/app/inquiry/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { inquiryRules, type InquiryField } from "@/lib/validate";

/**
 * Inquiry form.
 *
 * Progressively enhanced: it is a real `<form>` with a server action, so it posts
 * and works without JavaScript. The client layer only adds inline error display
 * and a pending state.
 *
 * Every input has a real, persistent `<label>` — the previous version used
 * 10px uppercase pseudo-labels above unlabelled inputs, which gave screen readers
 * nothing to announce, and its 500-character limit on the only free-text field
 * cut off exactly the detail that makes an inquiry worth replying to.
 */

const budgetOptions = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k+",
  "Not sure yet",
];

export default function InquiryForm({ contactEmail }: { contactEmail: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<InquiryField, string>>
  >({});
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitInquiry(formData);

      if (result.ok) {
        setDone(true);
        setFormError(null);
        setFieldErrors({});
        return;
      }

      setFormError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      // Move focus to the summary so the failure is announced, not just painted.
      requestAnimationFrame(() => errorRef.current?.focus());
    });
  }

  if (done) {
    return (
      <div
        // Announced on arrival for anyone not watching the screen.
        role="status"
        aria-live="polite"
        className="rounded-xl border border-line bg-surface-raised p-10 text-center shadow-sm sm:p-14"
      >
        <CheckCircle2
          size={40}
          strokeWidth={1.5}
          aria-hidden
          className="mx-auto text-positive"
        />
        <h2 className="mt-6 font-display text-2xl font-semibold text-fg">
          Message received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-fg-muted">
          Thanks — we&rsquo;ve got your details and we&rsquo;ll reply within one
          business day. If it&rsquo;s urgent, email us at{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
          >
            {contactEmail}
          </a>
          .
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setDone(false);
            formRef.current?.reset();
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      // Server-side validation is authoritative; skip the browser's own bubbles
      // so errors are reported in one consistent place.
      noValidate
      className="flex flex-col gap-6"
    >
      {formError ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-critical/40 bg-critical/8 p-4 text-sm text-fg"
        >
          <AlertCircle
            size={17}
            aria-hidden
            className="mt-0.5 shrink-0 text-critical"
          />
          <p>{formError}</p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="name"
          label="Your name"
          autoComplete="name"
          placeholder="Jane Doe"
          error={fieldErrors.name}
          required
        />
        <Field
          name="email"
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="jane@company.com"
          error={fieldErrors.email}
          required
        />
        <Field
          name="company"
          label="Company"
          hint="Optional"
          autoComplete="organization"
          placeholder="Acme Inc."
          error={fieldErrors.company}
        />
        <SelectField
          name="budget"
          label="Approximate budget"
          hint="Optional — helps us scope realistically"
          options={budgetOptions}
          error={fieldErrors.budget}
        />
      </div>

      <Field
        name="message"
        label="About the project"
        as="textarea"
        placeholder="What are you building, what problem does it solve, and when do you need it? Existing systems it has to work with are useful to know too."
        error={fieldErrors.message}
        required
      />

      {/* Honeypot. Hidden from sight and from assistive technology, but a naive
          bot fills every field it finds. `tabIndex={-1}` keeps keyboard users out. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website-field">Website</label>
        <input
          id="website-field"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-subtle">
          We reply within one business day. Your details stay between us.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 size={16} aria-hidden className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send inquiry
              <ArrowRight size={16} aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full rounded-md border bg-canvas px-3.5 py-2.5 text-base text-fg " +
  "placeholder:text-fg-subtle/70 transition-colors duration-150 " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring";

function Field({
  name,
  label,
  hint,
  error,
  as = "input",
  required,
  ...rest
}: {
  name: InquiryField;
  label: string;
  hint?: string;
  error?: string;
  as?: "input" | "textarea";
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const Control = as;

  return (
    <div className={cn("flex flex-col gap-2", as === "textarea" && "sm:col-span-2")}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required ? (
            <span aria-hidden className="ml-1 text-critical">
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <span id={`${id}-hint`} className="text-xs text-fg-subtle">
            {hint}
          </span>
        ) : null}
      </div>

      <Control
        id={id}
        name={name}
        required={required}
        maxLength={inquiryRules[name].max}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        rows={as === "textarea" ? 7 : undefined}
        className={cn(
          controlClasses,
          as === "textarea" && "resize-y",
          error ? "border-critical" : "border-line-strong",
        )}
        {...rest}
      />

      {error ? (
        <p id={`${id}-error`} className="text-sm text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  name,
  label,
  hint,
  options,
  error,
}: {
  name: InquiryField;
  label: string;
  hint?: string;
  options: string[];
  error?: string;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint ? (
          <span id={`${id}-hint`} className="text-xs text-fg-subtle">
            {hint}
          </span>
        ) : null}
      </div>

      <select
        id={id}
        name={name}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(
          controlClasses,
          "appearance-none",
          error ? "border-critical" : "border-line-strong",
        )}
      >
        <option value="">Select a range</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-critical">{error}</p> : null}
    </div>
  );
}
