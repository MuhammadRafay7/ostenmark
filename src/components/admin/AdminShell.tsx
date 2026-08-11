"use client";

import {
  Boxes,
  ExternalLink,
  FileText,
  Fingerprint,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Layers,
  Link2,
  ListChecks,
  LogOut,
  Mail,
  Menu,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { AdminButton, AdminDialog } from "@/components/admin/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";
import type { Brand } from "@/lib/types";

/**
 * Admin shell.
 *
 * Rewritten alongside the public redesign so the CMS uses the same tokens,
 * spacing and type scale as the site it edits. Three substantive fixes beyond
 * the styling:
 *
 * - **The brand was never loading.** It read `hero_content.content.studio_name`
 *   and `.logo_url`, but the brand editor writes to
 *   `brand_identity.content.brand.{studio_name,logo_url}`. The sidebar therefore
 *   always showed "STUDIO" with no logo, regardless of what was configured.
 * - **Removed non-functional chrome:** a "System Search" input wired to nothing
 *   and a notification bell with a permanent unread dot. Controls that look
 *   interactive but aren't are worse than absent ones.
 * - **Removed the custom cursor** (`lg:cursor-none`). Hiding the real cursor in a
 *   data-entry tool costs precision and breaks the OS pointer for anyone relying
 *   on cursor settings.
 */

const NAV: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Content", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Work", href: "/admin/projects", icon: FolderKanban },
  { label: "What we build", href: "/admin/services", icon: Boxes },
  { label: "Process", href: "/admin/approach", icon: ListChecks },
  { label: "Engagement", href: "/admin/engagement", icon: Handshake },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Brand", href: "/admin/brand", icon: Fingerprint },
  { label: "Capabilities", href: "/admin/stack", icon: Layers },
  { label: "Footer & contact", href: "/admin/footer", icon: Link2 },
  { label: "Inbox", href: "/admin/inbox", icon: Mail },
];

export default function AdminShell({
  children,
  brand,
}: {
  children: React.ReactNode;
  /**
   * Resolved server-side by the admin layout. Previously this component fetched
   * the brand itself in an effect — and read the wrong row while doing it, so the
   * sidebar always showed "STUDIO" with no logo. Passing it down removes both the
   * bug and a client round-trip on every admin page load.
   */
  brand: Brand;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  // Close the mobile drawer on navigation, adjusted during render rather than in
  // an effect so the drawer is never painted over the new page.
  const [navPath, setNavPath] = useState(pathname);
  if (pathname !== navPath) {
    setNavPath(pathname);
    setMenuOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // The auth screens render bare — no shell to sign in to yet.
  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>;
  }

  const sidebar = (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <Link
          href="/admin/dashboard"
          className="flex min-w-0 items-center gap-2.5 rounded-md"
        >
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS host, not in the image allowlist
            <img
              src={brand.logoUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md border border-line bg-canvas object-contain p-1"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent font-display text-sm font-semibold text-fg-on-accent"
            >
              {brand.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">
              {brand.name}
            </span>
            <span className="block text-xs text-fg-subtle">Content manager</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-md text-fg-subtle hover:bg-surface-sunken hover:text-fg lg:hidden"
        >
          <X size={16} aria-hidden />
          <span className="sr-only">Close menu</span>
        </button>
      </div>

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-subtle text-accent"
                      : "text-fg-muted hover:bg-surface-sunken hover:text-fg",
                  )}
                >
                  <item.icon size={16} aria-hidden className="shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-line px-3 py-3">
        {/* Theme control. The admin is built on the same semantic tokens as the
            public site, so it renders correctly in either theme — and this writes
            the same stored preference, rather than an admin-only setting. */}
        <div className="mb-1 flex items-center justify-between gap-2 px-3 py-1.5">
          <span className="text-sm text-fg-muted">Theme</span>
          <ThemeToggle />
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
        >
          View site
          <ExternalLink size={14} aria-hidden />
        </a>
        <a
          href="/cv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
        >
          Credentials sheet
          <FileText size={14} aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-critical/10 hover:text-critical"
        >
          <LogOut size={15} aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    // The accent is published locally here too, so the admin honours the brand
    // colour even though it renders outside the public layout's provider.
    <div
      className="min-h-screen bg-canvas text-fg"
      style={{ ["--accent" as string]: brand.accentColor }}
    >
      <AdminDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        description="You'll need to sign in again to make further changes."
        confirmLabel="Sign out"
      />

      {/* Mobile drawer */}
      {menuOpen ? (
        <div
          aria-hidden
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-90 bg-gray-950/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-100 w-64 transition-transform duration-200 lg:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
          >
            <Menu size={16} aria-hidden />
            Menu
          </AdminButton>
          <span className="truncate text-sm font-semibold text-fg">{brand.name}</span>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
