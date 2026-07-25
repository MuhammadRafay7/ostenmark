import AdminShell from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/lib/content";

/**
 * Admin layout.
 *
 * A server component so the brand (name, logo, accent colour) is resolved before
 * the shell renders. It reads through the same `getSiteSettings()` used by the
 * public site, which means the admin and the site can never disagree about the
 * brand — the previous client-side fetch read a different, non-existent path and
 * silently fell back to a placeholder.
 */
export const metadata = {
  title: "Content manager",
  // Never index the CMS, independently of robots.txt.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { brand } = await getSiteSettings();

  return <AdminShell brand={brand}>{children}</AdminShell>;
}
