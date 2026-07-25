"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY } from "@/components/ThemeScript";
import { cn } from "@/lib/cn";

type Choice = "system" | "light" | "dark";

const options: Array<{ value: Choice; label: string; Icon: typeof Sun }> = [
  { value: "system", label: "System theme", Icon: Monitor },
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
];

/** Same-tab change notification; `storage` only reaches other tabs. */
const THEME_EVENT = "starvix:themechange";

/**
 * The stored theme preference, modelled as an external store.
 *
 * `localStorage` genuinely *is* external state that React doesn't own, so
 * `useSyncExternalStore` is the right primitive rather than a `useState` seeded
 * from an effect. It also gets two things for free: a distinct server snapshot,
 * so there is no hydration mismatch and no need for a `mounted` flag, and
 * cross-tab synchronisation, since the browser fires `storage` in other tabs.
 */
const themeStore = {
  subscribe(onChange: () => void) {
    // `storage` fires in *other* tabs; the custom event covers this one.
    window.addEventListener("storage", onChange);
    window.addEventListener(THEME_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(THEME_EVENT, onChange);
    };
  },
  getSnapshot(): Choice {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
      // Private mode or blocked storage: report the default.
      return "system";
    }
  },
  // The server cannot know the visitor's preference.
  getServerSnapshot(): Choice {
    return "system";
  },
};

/**
 * Three-state theme control: system, light, dark.
 *
 * "System" is a real, selectable option rather than only the initial state — a
 * visitor whose OS switches at sunset should be able to go back to following it
 * after having once picked light or dark. Choosing it clears both the stored value
 * and the `data-theme` attribute, handing control back to the CSS media query.
 *
 * Exposed as a radiogroup so the three states are announced as one set with a
 * single selected member, which a cycling icon-button cannot convey.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const choice = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const apply = useCallback((next: Choice) => {
    const root = document.documentElement;

    try {
      if (next === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      /* Storage blocked — still apply the theme for this page view. */
    }

    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);

    // Notify this tab's subscribers; `storage` only reaches the others.
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface-raised p-0.5",
        className,
      )}
    >
      {options.map(({ value, label, Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => apply(value)}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full transition-colors duration-150",
              active
                ? "bg-accent text-fg-on-accent"
                : "text-fg-subtle hover:bg-surface-sunken hover:text-fg",
            )}
          >
            <Icon size={13} strokeWidth={2} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
