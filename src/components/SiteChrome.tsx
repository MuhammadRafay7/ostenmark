"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { SiteSettings } from "@/lib/types";

/**
 * Decides whether a route gets site chrome (header + footer).
 *
 * Two routes deliberately opt out:
 * - `/admin/*` — the CMS has its own shell.
 * - `/cv` — a printable document; navigation would end up in the PDF.
 *
 * This used to also force `data-theme="dark"` on `/admin/*`, because the admin was
 * styled with hardcoded dark colours and the light default bled through its panels.
 * Now that the admin is built on the same semantic tokens as the public site it
 * renders correctly in either theme, so the override is gone and the theme
 * preference is genuinely global — the toggle in the admin sidebar sets the same
 * stored value as the one on the public site.
 */
export default function SiteChrome({
  children,
  settings,
}: {
  children: ReactNode;
  settings: SiteSettings;
}) {
  const pathname = usePathname();
  const isBare = (pathname?.startsWith("/admin") ?? false) || pathname === "/cv";

  /**
   * Whether this render is a client-side navigation rather than the first paint.
   *
   * The distinction is the point: the enter animation starts from transparent, so
   * running it on first paint would push back the largest contentful paint on
   * every cold visit — a real cost paid by every visitor to buy an animation only
   * some of them ever see.
   *
   * Derived by remembering the path we booted on, rather than by flipping a flag
   * after mount. That keeps it a pure render with no effect and no ref read
   * (both of which the hooks lint rules reject here), and it can't desync during
   * hydration because the initial value is computed from the same pathname on
   * both sides.
   *
   * Known limitation: navigating away and back to the entry path renders that one
   * view unanimated, since the pathname matches again. Not worth extra machinery
   * — the failure mode is a missing animation, not a wrong one.
   */
  const [entryPath] = useState(pathname);
  const navigated = pathname !== entryPath;

  return (
    <div className="flex min-h-screen flex-col">
      {!isBare && <Navbar settings={settings} />}

      {/* Target of the skip link. tabIndex=-1 makes it programmatically
          focusable so focus actually moves there on activation. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Keyed by pathname so the subtree remounts on navigation, which is what
            re-triggers the CSS animation. Chrome and footer sit outside it and
            stay put, so the page reads as content changing within a frame rather
            than as a whole document being replaced.

            Bare routes (the admin, /cv) are never given the animation: it applies
            a `transform` to this wrapper, and a transformed ancestor becomes the
            containing block for `position: fixed`, which would make the admin's
            fixed sidebar scroll with the page instead of staying put. */}
        <div
          key={pathname}
          className={navigated && !isBare ? "route-enter" : undefined}
        >
          {children}
        </div>
      </main>

      {!isBare && <Footer settings={settings} />}
    </div>
  );
}
