"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { navigation } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/**
 * Site header.
 *
 * Rewritten for accessibility as much as for looks. The previous version used
 * 9px uppercase text with 0.3em tracking as its only navigation label — below
 * any reasonable legibility threshold — and its mobile menu had no accessible
 * name, no `aria-expanded`, no focus trap and no Escape handling, so a keyboard
 * user could tab into the page behind an open overlay.
 */
export default function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const { brand } = settings;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on navigation, so the overlay can't survive a route change.
  //
  // Adjusting state during render rather than in an effect: React re-runs this
  // component immediately with the corrected state, before anything is painted,
  // so the stale-open panel is never visible. Doing it in an effect would paint
  // the open panel over the new route for a frame first.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to the control that opened the panel, or it lands on <body>.
    toggleRef.current?.focus();
  }, []);

  // Lock scroll, trap focus and handle Escape while the panel is open.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Cycle within the panel rather than escaping to the page behind it.
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  function isActive(href: string) {
    if (href.startsWith("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-100 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70"
          : "border-transparent bg-canvas",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between gap-6 px-6 sm:px-8 lg:h-18 lg:px-12">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-md"
          aria-label={`${brand.name} — home`}
        >
          {brand.logoUrl ? (
            <span className="relative block h-8 w-8 overflow-hidden rounded-md border border-line bg-surface-raised">
              <Image
                src={brand.logoUrl}
                alt=""
                fill
                sizes="32px"
                className="object-contain p-1"
                priority
              />
            </span>
          ) : (
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-md bg-accent font-display text-sm font-semibold text-fg-on-accent"
            >
              {brand.logoInitial}
            </span>
          )}
          <span className="font-display text-base font-semibold tracking-tight text-fg">
            {brand.name}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                    isActive(item.href)
                      ? "text-fg"
                      : "text-fg-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />

          <Link
            href="/inquiry"
            className="hidden h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-fg-on-accent transition-colors duration-200 hover:bg-accent-hover sm:inline-flex"
          >
            Start a project
            <ArrowRight size={14} aria-hidden />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-9 w-9 place-items-center rounded-md border border-line text-fg transition-colors hover:bg-surface lg:hidden"
          >
            {open ? <X size={17} aria-hidden /> : <Menu size={17} aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-canvas lg:hidden"
          >
            <nav aria-label="Main" className="px-6 py-4 sm:px-8">
              <ul className="flex flex-col divide-y divide-line">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between py-3.5 text-base font-medium",
                        isActive(item.href) ? "text-accent" : "text-fg",
                      )}
                    >
                      {item.label}
                      <ArrowRight size={15} aria-hidden className="text-fg-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-5">
                <ThemeToggle />
                <Link
                  href="/inquiry"
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-fg-on-accent"
                >
                  Start a project
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
