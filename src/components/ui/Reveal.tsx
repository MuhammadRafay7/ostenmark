"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Scroll-triggered entrance animation.
 *
 * One component for the whole site, for two reasons:
 *
 * - **Reduced motion.** The previous code animated with Framer Motion in a dozen
 *   places with no `prefers-reduced-motion` handling anywhere. CSS overrides can't
 *   help there, because Framer animates via inline style. Checking the preference
 *   here and rendering a plain element instead is the only reliable fix, and doing
 *   it once means it can't be forgotten in a new section.
 * - **Consistency.** A single distance/duration/easing, so the page reads as one
 *   document rather than a collection of differently-tuned components.
 *
 * The movement is intentionally small (12px): at this scale it reads as
 * settling into place rather than as an effect.
 */

const variants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  /** Seconds. Use sparingly — long stagger chains feel slow, not considered. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      // `once` matters: re-animating on every scroll-past is distracting and
      // makes long pages feel unstable.
      viewport={{ once: true, margin: "-64px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggers direct `Reveal.Item` children. Preferred over per-child `delay`
 * props, which get out of sync as soon as list length changes.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.07,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag className={cn(className)} variants={variants}>
      {children}
    </MotionTag>
  );
}
