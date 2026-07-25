import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, with later Tailwind utilities beating earlier ones in the
 * same group. Without `twMerge`, a `className` prop passed to a primitive can't
 * override the primitive's own defaults — the order in the final string is
 * arbitrary, so `p-4` and `p-8` would fight non-deterministically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
