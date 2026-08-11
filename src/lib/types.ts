/**
 * Domain model for the public site.
 *
 * These types describe the *normalised* shape the UI consumes — not the raw
 * Supabase rows. Raw rows are loosely typed JSON written by the admin CMS
 * (see /admin/*), where every field is effectively optional and image columns
 * may hold either a storage path or an absolute URL. `src/lib/content.ts` is
 * the single place that reads those rows and narrows them to the types here,
 * so components never deal with `undefined` or unresolved paths.
 */

/** A case study. `coverImage` is always an absolute URL or null. */
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string | null;
  gallery: string[];
  stack: string[];
  liveUrl: string | null;
  apkUrl: string | null;
  featured: boolean;
  orderIndex: number;
  createdAt: string | null;
}

/** Brand identity, editable at /admin/brand. */
export interface Brand {
  name: string;
  logoUrl: string | null;
  logoInitial: string;
  /**
   * Dedicated favicon asset. Separate from `logoUrl` because a wordmark that
   * works in the header is usually illegible at 32px — a favicon normally needs
   * a cropped mark. Falls back to the logo, then to the initial.
   */
  faviconUrl: string | null;
  /** Hex colour. Injected as the `--accent` custom property at runtime. */
  accentColor: string;
}

/**
 * A team member, editable at /admin/team.
 *
 * The public team section renders only when at least one member exists, so a
 * solo operator is never forced to display a one-person "team" — see the
 * positioning note in the project memory.
 */
export interface TeamMember {
  /** Stable id so React keys and reordering survive edits. */
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  orderIndex: number;
}

/** Team section content, editable at /admin/team. */
export interface TeamContent {
  /** Section heading. Empty falls back to a sensible default in the UI. */
  heading: string;
  intro: string;
  members: TeamMember[];
}

export interface SocialLink {
  /** Stable key used for icon lookup: github | linkedin | twitter | instagram | email. */
  id: string;
  label: string;
  url: string;
}

/** Contact and status details shown in the footer and on the contact page. */
export interface ContactInfo {
  email: string;
  phone: string | null;
  location: string;
  /** IANA timezone used for the "local time" indicator. */
  timezone: string;
  availability: string;
  /** Response-time commitment — a real, verifiable trust signal. */
  responseTime: string;
}

/** Copy for the homepage hero, editable at /admin (Hero tab). */
export interface HeroContent {
  eyebrow: string;
  /** Headline is stored as two lines by the CMS; rendered as one balanced block. */
  titleLead: string;
  titleEmphasis: string;
  subtext: string;
}

/** Copy for the about page, editable at /admin (Philosophy tab). */
export interface AboutContent {
  titleLead: string;
  titleEmphasis: string;
  subheading: string;
  narrative: string;
  experienceYears: string;
  portraitUrl: string | null;
  capabilities: string[];
}

/**
 * A section's heading block — the eyebrow, title and lede at the top of each
 * homepage section. Editable alongside the section's items.
 */
export interface SectionHeadingContent {
  eyebrow: string;
  title: string;
  lede: string;
}

/** One card in "What we build". Editable at /admin/services. */
export interface ServiceItem {
  id: string;
  title: string;
  /** Key into `SECTION_ICONS`; resolved to a lucide component at render. */
  icon: string;
  summary: string;
  outcome: string;
  stack: string[];
}

/** "What we build" section content. */
export interface ServicesContent {
  heading: SectionHeadingContent;
  items: ServiceItem[];
}

/** One phase in "A process you can hold us to". Editable at /admin/approach. */
export interface ApproachPhase {
  id: string;
  title: string;
  duration: string;
  summary: string;
  deliverable: string;
}

/** "A process you can hold us to" section content. */
export interface ApproachContent {
  heading: SectionHeadingContent;
  items: ApproachPhase[];
}

/** One card in "Ways to work with us". Editable at /admin/engagement. */
export interface EngagementModel {
  id: string;
  name: string;
  duration: string;
  summary: string;
  includes: string[];
}

/** "Ways to work with us" section content. */
export interface EngagementContent {
  heading: SectionHeadingContent;
  items: EngagementModel[];
}

/**
 * Everything the root layout needs in one object, so chrome (nav, footer)
 * renders from server-fetched data instead of refetching per component.
 */
export interface SiteSettings {
  brand: Brand;
  contact: ContactInfo;
  socials: SocialLink[];
  footerNarrative: string;
  copyright: string;
  capabilities: string[];
}

/** Result of the contact form server action. */
export type InquiryResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
