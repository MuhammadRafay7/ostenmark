import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Layout primitives.
 *
 * The previous codebase repeated `max-w-[1400px] mx-auto px-6 md:px-12` and
 * `py-32 md:py-40` in every section, which meant page rhythm drifted whenever one
 * was edited. These encode the two decisions — measure and vertical rhythm — once.
 */

type Width = "content" | "page" | "wide" | "full";

const widths: Record<Width, string> = {
  /** Long-form reading measure — roughly 70 characters. */
  content: "max-w-content",
  page: "max-w-page",
  wide: "max-w-wide",
  full: "max-w-none",
};

export function Container({
  children,
  width = "page",
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("mx-auto w-full px-6 sm:px-8 lg:px-12", widths[width], className)}>
      {children}
    </Tag>
  );
}

type Spacing = "sm" | "md" | "lg";

const spacings: Record<Spacing, string> = {
  sm: "py-14 sm:py-16",
  md: "py-20 sm:py-24 lg:py-28",
  lg: "py-24 sm:py-32 lg:py-40",
};

/**
 * A page section. `surface` opts into the alternate background used to separate
 * adjacent bands without needing a border.
 */
export function Section({
  children,
  id,
  spacing = "md",
  surface = false,
  className,
  containerWidth = "page",
  bare = false,
}: {
  children: ReactNode;
  id?: string;
  spacing?: Spacing;
  surface?: boolean;
  className?: string;
  containerWidth?: Width;
  /** Skip the inner Container — for sections that manage their own layout. */
  bare?: boolean;
}) {
  return (
    <section
      id={id}
      // scroll-mt keeps in-page anchors clear of the sticky header.
      className={cn(
        "scroll-mt-24",
        spacings[spacing],
        surface && "border-y border-line bg-surface",
        className,
      )}
    >
      {bare ? children : <Container width={containerWidth}>{children}</Container>}
    </section>
  );
}

/** Small uppercase label that opens a section. Renders its own accent marker. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("label flex items-center gap-2.5 text-fg-subtle", className)}>
      <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
      {children}
    </p>
  );
}

/**
 * Section heading block. Enforces the eyebrow → title → lede order and the
 * spacing between them, so no two sections introduce themselves differently.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "start",
  level = 2,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "start" | "center";
  /** Heading level, so document outline stays correct wherever this is used. */
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const Heading = `h${level}` as ElementType;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        className={cn(
          "text-balance font-display text-fg",
          level === 1 ? "text-display-lg" : "text-display-sm",
        )}
      >
        {title}
      </Heading>
      {lede ? (
        <p
          className={cn(
            "max-w-2xl text-lg text-fg-muted",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/** Muted metadata chip — used for tech stack tags and categories. */
export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-2xs tracking-normal text-fg-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
