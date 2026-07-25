"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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

  return (
    <div className="flex min-h-screen flex-col">
      {!isBare && <Navbar settings={settings} />}

      {/* Target of the skip link. tabIndex=-1 makes it programmatically
          focusable so focus actually moves there on activation. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      {!isBare && <Footer settings={settings} />}
    </div>
  );
}
