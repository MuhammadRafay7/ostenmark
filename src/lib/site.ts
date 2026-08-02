/**
 * Build-time site constants.
 *
 * These are the values that must exist before any database call — the canonical
 * URL for metadata, and the fallbacks used when the CMS has no row yet (fresh
 * deploy, or Supabase unreachable). Anything a client can edit belongs in the
 * CMS instead; anything needed for SEO or that must never be empty belongs here.
 */

/**
 * Canonical origin, used for metadataBase, sitemap, robots and JSON-LD.
 * Falls back to the Vercel-provided URL, then localhost, so preview
 * deployments generate correct absolute URLs without extra config.
 */
export const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
})();

export const siteName = "Ostenmark";

export const siteTagline = "Product engineering studio";

export const siteDescription =
  "Ostenmark is a product engineering studio. We design and build web and mobile " +
  "software for companies that need it shipped properly — clear scope, working " +
  "software every week, and support after launch.";

/**
 * Primary navigation. Paths are deliberately unchanged from the previous site
 * so existing links, admin deep links and any indexed URLs keep resolving.
 */
export const navigation = [
  { label: "Work", href: "/projects" },
  { label: "Services", href: "/#services" },
  { label: "Expertise", href: "/tech-stack" },
  { label: "About", href: "/philosophy" },
] as const;

/** Fallbacks used when the CMS has no `brand_identity` row. */
export const brandDefaults = {
  name: siteName,
  accentColor: "#1f47e0",
} as const;

/** Fallbacks used when the CMS has no `hero_content` row. */
export const contactDefaults = {
  email: "hello@ostenmark.com",
  location: "Remote — worldwide",
  timezone: "UTC",
  availability: "Available for new projects",
  responseTime: "Replies within one business day",
} as const;

/**
 * How we engage. Static by design: these are commercial commitments, not
 * marketing copy, and they should change through code review rather than a CMS
 * field. Enterprise buyers look for this before they look at the work.
 */
export const engagementModels = [
  {
    name: "Discovery sprint",
    duration: "1–2 weeks",
    summary:
      "A fixed-price engagement to pin down scope, architecture and cost before anyone commits to a build. You leave with a technical plan and an estimate you can budget against.",
    includes: [
      "Requirements and constraints workshop",
      "Architecture and integration plan",
      "Delivery estimate with risk register",
    ],
  },
  {
    name: "Project build",
    duration: "6–16 weeks",
    summary:
      "Fixed scope, milestone-based delivery. Suited to a defined product or platform where the outcome is agreed up front and progress is demonstrable each week.",
    includes: [
      "Milestone schedule with agreed acceptance criteria",
      "Weekly demo of working software",
      "Handover documentation and source ownership",
    ],
  },
  {
    name: "Embedded team",
    duration: "Monthly, rolling",
    summary:
      "We work as part of your team on a continuing basis, using your board and your rituals. Appropriate where priorities shift faster than a fixed scope can absorb.",
    includes: [
      "Agreed monthly capacity",
      "Direct access in your own Slack or Teams",
      "30-day notice, no lock-in",
    ],
  },
] as const;

/**
 * Operating commitments. Every item here is a statement about how we work that
 * can be independently verified by a client — deliberately chosen over invented
 * client logos, testimonials or project counts.
 */
export const commitments = [
  {
    label: "Response time",
    value: "< 1 day",
    detail: "Every inquiry gets a considered reply within one business day.",
  },
  {
    label: "Code ownership",
    value: "100% yours",
    detail: "You own the repository and the IP from the first commit, in writing.",
  },
  {
    label: "Delivery cadence",
    value: "Weekly",
    detail: "Working software you can click through every week, not status reports.",
  },
  {
    label: "Time zones",
    value: "4h overlap",
    detail: "Guaranteed daily overlap with EU and US East working hours.",
  },
] as const;
