import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The single button/CTA implementation.
 *
 * Renders an `<a>` when given `href` and a `<button>` otherwise, because the
 * distinction is semantic (navigation vs. action) and screen readers and
 * middle-click behaviour depend on getting it right. Both share one style table
 * so a link CTA and a submit CTA are never visually inconsistent.
 */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-md font-medium " +
  "whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] " +
  "duration-200 ease-out-quint select-none " +
  "disabled:pointer-events-none disabled:opacity-55 " +
  "active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-fg-on-accent shadow-sm hover:bg-accent-hover hover:shadow-md",
  secondary:
    "border border-line-strong bg-surface-raised text-fg shadow-xs hover:border-fg-subtle hover:bg-surface",
  ghost: "text-fg-muted hover:bg-surface hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children">;

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

function classes(variant: Variant, size: Size, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonAsButton) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: ButtonAsLink) {
  const isExternal = /^https?:\/\//i.test(href) || href.startsWith("mailto:");

  // next/link would intercept these as client navigations; external and mailto
  // targets need a plain anchor with the right rel attributes.
  if (isExternal) {
    return (
      <a
        href={href}
        className={classes(variant, size, className)}
        {...(href.startsWith("mailto:")
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
