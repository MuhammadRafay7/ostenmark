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

/**
 * Fallbacks used when the CMS has no `hero_content` row.
 *
 * Both addresses are editable at /admin/footer — these values only apply on a
 * fresh deploy, or if Supabase is unreachable. `notifyEmail` is where contact
 * form submissions are delivered; it is never rendered on the public site.
 */
export const contactDefaults = {
  email: "hello@ostenmark.com",
  notifyEmail: "hello@ostenmark.com",
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

/* -------------------------------------------------------------------------- */
/* Homepage section defaults                                                   */
/*                                                                            */
/* "What we build", "A process you can hold us to" and "Ways to work with us" */
/* are editable at /admin/services, /admin/approach and /admin/engagement.    */
/* These are the fallbacks used when the CMS has no row yet, so the site      */
/* renders identically on a fresh deploy. `content.ts` reads the CMS and      */
/* falls back to exactly these values field by field.                         */
/* -------------------------------------------------------------------------- */

/** "What we build" — the studio's disciplines. `icon` is a key from `SECTION_ICONS`. */
export const servicesDefaults = {
  heading: {
    eyebrow: "Services",
    title: "What we build",
    lede: "Four disciplines, one team. Most engagements draw on more than one — a platform needs infrastructure, and infrastructure needs someone accountable for the interface on top of it.",
  },
  items: [
    {
      title: "Web platforms",
      icon: "layout",
      summary:
        "Customer-facing products and internal tools built as one coherent system — server-rendered, fast on a mid-range phone, and maintainable by whoever inherits it.",
      outcome: "A production application your team can extend without a rewrite.",
      stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
      title: "APIs & infrastructure",
      icon: "cloud",
      summary:
        "The parts that decide whether a product survives its own growth: data modelling, authentication, background work, and deployment that is reproducible rather than remembered.",
      outcome: "Infrastructure documented well enough to hand over.",
      stack: ["Node.js", "PostgreSQL", "Supabase", "Redis"],
    },
    {
      title: "Mobile applications",
      icon: "smartphone",
      summary:
        "Cross-platform apps from a single codebase, released to both stores. One team, one set of business logic, and no drift between the iOS and Android experience.",
      outcome: "Shipped to the App Store and Play Store, with release tooling in place.",
      stack: ["React Native", "Expo", "iOS", "Android"],
    },
    {
      title: "Systems integration",
      icon: "boxes",
      summary:
        "Payments, identity, messaging and the third-party services a real business already runs on — wired in with the failure cases handled, not just the happy path.",
      outcome: "Integrations with retries, reconciliation and audit trails.",
      stack: ["Stripe", "OAuth / SSO", "Webhooks", "Twilio"],
    },
  ],
} as const;

/** "A process you can hold us to" — the delivery phases. `step` is derived from order. */
export const approachDefaults = {
  heading: {
    eyebrow: "Approach",
    title: "A process you can hold us to",
    lede: "Four phases, each ending in something concrete you receive. No phase depends on trust that the next one will go well.",
  },
  items: [
    {
      title: "Scope",
      duration: "1–2 weeks",
      summary:
        "We establish what is actually being built and what it depends on — users, constraints, existing systems, and the parts nobody has decided yet.",
      deliverable: "Technical plan, architecture outline, and a costed estimate.",
    },
    {
      title: "Design",
      duration: "2–4 weeks",
      summary:
        "Interface and data model together, validated with you before implementation. Direction is agreed on screens, not on descriptions of screens.",
      deliverable: "Clickable prototype and a reviewed component inventory.",
    },
    {
      title: "Build",
      duration: "4–12 weeks",
      summary:
        "Delivery in weekly increments against the agreed milestones. You see working software each week and can redirect while it is still cheap to do so.",
      deliverable: "Weekly demo, staging environment, and a tested main branch.",
    },
    {
      title: "Launch & support",
      duration: "Ongoing",
      summary:
        "Deployment, monitoring and the unglamorous work of the first weeks in production — then continued support on terms you can exit.",
      deliverable: "Production release, runbook, handover, and a support agreement.",
    },
  ],
} as const;

/** "Ways to work with us" — the engagement models. Items reuse `engagementModels`. */
export const engagementDefaults = {
  heading: {
    eyebrow: "Engagement models",
    title: "Ways to work with us",
    lede: "Most clients start with a discovery sprint and continue into a build. Pricing depends on scope — the terms below don't.",
  },
  items: engagementModels,
} as const;
