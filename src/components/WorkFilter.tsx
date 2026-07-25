import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Category filter for the work index.
 *
 * Implemented as links that set a `?category=` search param rather than as
 * client-side `useState`. Three consequences, all of them the point: a filtered
 * view is a shareable URL, the back button works, and the page stays a server
 * component with no JavaScript needed to filter.
 */
export default function WorkFilter({
  categories,
  active,
  counts,
}: {
  categories: string[];
  active: string;
  counts: Record<string, number>;
}) {
  const options = [{ label: "All", value: "all" }].concat(
    categories.map((category) => ({ label: category, value: category })),
  );

  return (
    <nav aria-label="Filter work by category" className="no-scrollbar -mx-1 overflow-x-auto">
      <ul className="flex items-center gap-1.5 px-1">
        {options.map((option) => {
          const isActive = active === option.value;
          return (
            <li key={option.value}>
              <Link
                href={
                  option.value === "all"
                    ? "/projects"
                    : `/projects?category=${encodeURIComponent(option.value)}`
                }
                // `aria-current` is what tells assistive tech which filter is
                // applied; colour alone would not.
                aria-current={isActive ? "true" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "border-accent bg-accent text-fg-on-accent"
                    : "border-line bg-surface-raised text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "font-mono text-2xs tracking-normal",
                    isActive ? "text-fg-on-accent/70" : "text-fg-subtle",
                  )}
                >
                  {counts[option.value] ?? 0}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
