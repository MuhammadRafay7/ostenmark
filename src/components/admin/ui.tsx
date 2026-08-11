"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Admin UI kit.
 *
 * The admin was eight pages of independently-authored markup: `rounded-[3.5rem]`
 * next to `rounded-xl`, hardcoded `#1E293B` everywhere, four different modal
 * implementations copy-pasted between files, and 8–10px uppercase labels with
 * `0.4em` tracking on form fields. It also spoke a different language from the
 * product it edits ("Commit Entry", "Vault Sync Failed", "Decommission Module"),
 * which makes a CMS harder to use, not more impressive.
 *
 * These primitives use the same semantic tokens as the public site, so the admin
 * inherits the design system rather than approximating it. Copy here is plain
 * English: this is a tool, and a tool should say "Save changes".
 */

/* -------------------------------------------------------------------------- */
/* Page scaffolding                                                           */
/* -------------------------------------------------------------------------- */

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-fg-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </header>

      <div className="mt-8 flex flex-col gap-6 pb-20">{children}</div>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  icon: Icon,
  footer,
  children,
  className,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-surface-raised shadow-sm",
        className,
      )}
    >
      {title ? (
        <header className="flex items-start gap-3 border-b border-line px-6 py-5">
          {Icon ? (
            <Icon size={17} aria-hidden className="mt-0.5 shrink-0 text-accent" />
          ) : null}
          <div>
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-fg-muted">{description}</p>
            ) : null}
          </div>
        </header>
      ) : null}

      <div className="px-6 py-6">{children}</div>

      {footer ? (
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-4">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/** Responsive form grid. Children spanning both columns use `sm:col-span-2`. */
export function AdminGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Form controls                                                              */
/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full rounded-md border border-line-strong bg-canvas px-3 py-2.5 text-sm text-fg " +
  "placeholder:text-fg-subtle/70 transition-colors " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring " +
  "disabled:opacity-60";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
  /** Spans both columns of AdminGrid. */
  wide?: boolean;
}

/**
 * Wraps a control with a real `<label>` and wires up hint/error descriptions.
 * Every admin field goes through this, so none can ship unlabelled.
 */
function FieldShell({
  label,
  hint,
  error,
  wide,
  id,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminInput({
  label,
  hint,
  error,
  wide,
  ...rest
}: FieldChrome & Omit<ComponentProps<"input">, "className" | "id">) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <input
        id={id}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        aria-invalid={error ? true : undefined}
        className={cn(controlClasses, error && "border-critical")}
        {...rest}
      />
    </FieldShell>
  );
}

export function AdminTextarea({
  label,
  hint,
  error,
  wide = true,
  rows = 5,
  ...rest
}: FieldChrome & Omit<ComponentProps<"textarea">, "className" | "id">) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <textarea
        id={id}
        rows={rows}
        aria-describedby={cn(hint && `${id}-hint`) || undefined}
        className={cn(controlClasses, "resize-y leading-relaxed", error && "border-critical")}
        {...rest}
      />
    </FieldShell>
  );
}

export function AdminSelect({
  label,
  hint,
  error,
  wide,
  options,
  ...rest
}: FieldChrome & { options: string[] } & Omit<
    ComponentProps<"select">,
    "className" | "id" | "children"
  >) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <select id={id} className={cn(controlClasses, "appearance-none")} {...rest}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/**
 * Searchable single-select. Same role as `AdminSelect`, but with a filter box —
 * for long option lists (time zones, currencies) where a native select's
 * type-ahead isn't discoverable. Closes on outside click or Escape; the search
 * input is focused on open so you can type immediately.
 */
export function AdminCombobox({
  label,
  hint,
  error,
  wide,
  options,
  value,
  onValueChange,
  placeholder = "Select…",
}: FieldChrome & {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Closing also clears the filter, so the panel reopens showing every option.
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((option) => option.toLowerCase().includes(needle))
    : options;

  function select(option: string) {
    onValueChange(option);
    close();
  }

  return (
    <FieldShell label={label} hint={hint} error={error} wide={wide} id={id}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className={cn(
            controlClasses,
            "flex items-center justify-between gap-2 text-left",
          )}
        >
          <span className={cn("truncate", !value && "text-fg-subtle/70")}>
            {value || placeholder}
          </span>
          <ChevronDown size={15} aria-hidden className="shrink-0 text-fg-subtle" />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-md border border-line-strong bg-surface-raised shadow-lg">
            <div className="border-b border-line p-2">
              <div className="flex items-center gap-2 rounded-md border border-line-strong bg-canvas px-2.5">
                <Search size={14} aria-hidden className="shrink-0 text-fg-subtle" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search…"
                  aria-label={`Search ${label}`}
                  className="w-full bg-transparent py-2 text-sm text-fg placeholder:text-fg-subtle/70 focus:outline-none"
                />
              </div>
            </div>
            <ul className="max-h-56 overflow-y-auto p-1" role="listbox">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-fg-subtle">No matches.</li>
              ) : (
                filtered.map((option) => {
                  const active = option === value;
                  return (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => select(option)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-accent-subtle text-accent"
                            : "text-fg hover:bg-surface-sunken",
                        )}
                      >
                        <span className="truncate">{option}</span>
                        {active ? (
                          <Check size={14} aria-hidden className="shrink-0" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}

/** Checkbox with the label as its accessible name and a supporting description. */
export function AdminCheckbox({
  label,
  description,
  ...rest
}: { label: string; description?: string } & Omit<
  ComponentProps<"input">,
  "type" | "className"
>) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        {...rest}
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<AdminButtonVariant, string> = {
  primary: "bg-accent text-fg-on-accent hover:bg-accent-hover shadow-sm",
  secondary:
    "border border-line-strong bg-surface-raised text-fg hover:border-fg-subtle hover:bg-surface",
  ghost: "text-fg-muted hover:bg-surface hover:text-fg",
  danger: "border border-critical/40 text-critical hover:bg-critical/10",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  busy = false,
  children,
  className,
  disabled,
  ...rest
}: {
  variant?: AdminButtonVariant;
  size?: "sm" | "md";
  /** Shows a spinner and blocks interaction — for in-flight requests. */
  busy?: boolean;
  children: ReactNode;
  // `className` is kept (not omitted) so callers can extend the variant, e.g. a
  // ghost button that turns critical-red on hover.
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      disabled={disabled || busy}
      // Communicates the pending state to assistive tech, not just visually.
      aria-busy={busy || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-55",
        size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...rest}
    >
      {busy ? <Loader2 size={15} aria-hidden className="animate-spin" /> : null}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Inline save/error feedback.
 *
 * Replaces the pattern of a full-screen celebratory modal on every successful
 * save ("Identity Set", "Synchronized", requiring an "Acknowledge" click). A save
 * confirmation should not interrupt the person saving; it should just be visible.
 * Errors previously used `alert()`, which is worse still.
 */
export function AdminStatus({
  state,
  message,
}: {
  state: "idle" | "saved" | "error";
  message?: string;
}) {
  if (state === "idle") return null;

  const saved = state === "saved";

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-sm",
        saved ? "text-positive" : "text-critical",
      )}
    >
      {saved ? (
        <CheckCircle2 size={15} aria-hidden />
      ) : (
        <AlertTriangle size={15} aria-hidden />
      )}
      {message ?? (saved ? "Changes saved." : "Something went wrong.")}
    </p>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="text-sm font-medium text-fg">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
    >
      <Loader2 size={22} aria-hidden className="animate-spin text-accent" />
      <p className="text-sm text-fg-muted">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                     */
/* -------------------------------------------------------------------------- */

/** No-op subscribe: whether we've hydrated never changes after the first commit. */
const noopSubscribe = () => () => {};

/**
 * Portals into `document.body` once hydrated.
 *
 * "Have we hydrated yet?" is genuinely external state — it belongs to the
 * renderer, not to React state — so `useSyncExternalStore` with distinct client
 * and server snapshots expresses it directly. The alternative (`useState(false)`
 * plus an effect that immediately sets it true) causes a second render pass on
 * every mount and is what the set-state-in-effect rule warns about.
 */
function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}

/**
 * Confirmation dialog — the single implementation, replacing four near-identical
 * copies across the admin plus two bare `confirm()` calls.
 *
 * Properly modal: `role="dialog"` with `aria-modal`, an accessible name, focus
 * moved in and restored on close, focus trapped while open, and Escape to
 * dismiss. The destructive action is never the initially focused control.
 */
export function AdminDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // Focus Cancel, not Confirm — a stray Enter must not delete anything.
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
        <div
          // Decorative backdrop; the dialog below owns the semantics.
          aria-hidden
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby={description ? "admin-dialog-description" : undefined}
          className="relative w-full max-w-sm rounded-xl border border-line bg-surface-raised p-6 shadow-xl"
        >
          <div className="flex items-start gap-3">
            {destructive ? (
              <AlertTriangle
                size={18}
                aria-hidden
                className="mt-0.5 shrink-0 text-critical"
              />
            ) : null}
            <div>
              <h2
                id="admin-dialog-title"
                className="text-base font-semibold text-fg"
              >
                {title}
              </h2>
              {description ? (
                <p
                  id="admin-dialog-description"
                  className="mt-2 text-sm text-fg-muted"
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <AdminButton ref={cancelRef} variant="secondary" onClick={onClose}>
              Cancel
            </AdminButton>
            <AdminButton
              variant={destructive ? "danger" : "primary"}
              onClick={onConfirm}
              busy={busy}
            >
              {confirmLabel}
            </AdminButton>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
          >
            <X size={16} aria-hidden />
            <span className="sr-only">Close dialog</span>
          </button>
        </div>
      </div>
    </Portal>
  );
}
