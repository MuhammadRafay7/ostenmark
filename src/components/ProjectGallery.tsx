"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Case-study gallery with a lightbox.
 *
 * Rebuilt primarily for keyboard and screen-reader access. The previous version
 * opened its lightbox from an `onClick` on a plain `<div>` — unreachable by
 * keyboard and invisible to assistive technology — and the overlay was not a
 * dialog, had no accessible name, no focus containment, and unlabelled
 * previous/next buttons that announced as "button".
 *
 * Thumbnails are real `<button>`s, the overlay is a modal dialog, focus is
 * trapped while it is open and restored to the originating thumbnail on close.
 */
export default function ProjectGallery({
  images,
  projectTitle,
}: {
  images: string[];
  projectTitle: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Remember which thumbnail opened the dialog so focus can return to it.
  const originRef = useRef<HTMLButtonElement | null>(null);

  const isOpen = openIndex !== null;
  const total = images.length;

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + total) % total,
      ),
    [total],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    originRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          close();
          break;
        case "ArrowLeft":
          event.preventDefault();
          step(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          step(1);
          break;
        case "Tab": {
          // Keep focus inside the dialog — otherwise it walks into the page
          // behind the overlay, which is still rendered.
          const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
              "button:not([disabled])",
            ) ?? [],
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
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, step]);

  if (total === 0) return null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <li
            key={src}
            // Give the first image of each group of three full width, so the
            // grid has some rhythm rather than being a uniform tile field.
            className={cn(index % 3 === 0 && "sm:col-span-2")}
          >
            <button
              type="button"
              onClick={(event) => {
                originRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
              className={cn(
                "group relative block w-full overflow-hidden rounded-lg border border-line bg-surface",
                index % 3 === 0 ? "aspect-21/9" : "aspect-16/10",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes={
                  index % 3 === 0
                    ? "(min-width: 640px) 90vw, 100vw"
                    : "(min-width: 640px) 45vw, 100vw"
                }
                className="object-cover transition-transform duration-700 ease-out-quint group-hover:scale-[1.02]"
              />
              <span className="sr-only">
                View image {index + 1} of {total} from {projectTitle} at full size
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${projectTitle} — image ${openIndex + 1} of ${total}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            className="fixed inset-0 z-200 flex flex-col bg-gray-950/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <p className="font-mono text-xs text-gray-400">
                {openIndex + 1} / {total}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} aria-hidden />
                <span className="sr-only">Close image viewer</span>
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
              <div className="relative h-full w-full max-w-6xl">
                <Image
                  key={images[openIndex]}
                  src={images[openIndex]!}
                  alt={`${projectTitle} — image ${openIndex + 1} of ${total}`}
                  fill
                  sizes="100vw"
                  quality={92}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {total > 1 ? (
              <div className="flex items-center justify-center gap-3 border-t border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft size={20} aria-hidden />
                  <span className="sr-only">Previous image</span>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight size={20} aria-hidden />
                  <span className="sr-only">Next image</span>
                </button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
