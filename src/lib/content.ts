import { unstable_cache } from "next/cache";

import { resolveStorageUrl, supabaseServer } from "@/lib/supabase/server";
import {
  approachDefaults,
  brandDefaults,
  contactDefaults,
  engagementDefaults,
  servicesDefaults,
  siteName,
} from "@/lib/site";
import type {
  AboutContent,
  ApproachContent,
  ApproachPhase,
  Brand,
  ContactInfo,
  EngagementContent,
  EngagementModel,
  HeroContent,
  Project,
  SectionHeadingContent,
  ServiceItem,
  ServicesContent,
  SiteSettings,
  SocialLink,
  TeamContent,
  TeamMember,
} from "@/lib/types";

/**
 * The only module that reads public content out of Supabase.
 *
 * Two responsibilities:
 *
 * 1. **Caching.** Every read is wrapped in `unstable_cache` with a tag, so pages
 *    render from cache instead of hitting Supabase per request. The previous
 *    implementation set `dynamic = "force-dynamic"` on the homepage, which meant
 *    a database round-trip from a single region on every single visit — the worst
 *    case for international visitors. Tags let the admin bust specific content
 *    (see `revalidateContent`) without dropping the whole cache.
 *
 * 2. **Normalisation.** CMS rows are untrusted JSON where any field may be
 *    missing. Everything is narrowed to the types in `src/lib/types.ts` with
 *    sensible fallbacks here, so no component needs a `?.` chain or a hardcoded
 *    default.
 */

export const CACHE_TAGS = {
  settings: "site-settings",
  projects: "projects",
  about: "about-content",
  team: "team-content",
  services: "services-content",
  approach: "approach-content",
  engagement: "engagement-content",
} as const;

/** Revalidate at most hourly even if nothing explicitly busts the tag. */
const ONE_HOUR = 3600;

/* -------------------------------------------------------------------------- */
/* Row shapes — loose by nature, since the CMS writes partial JSON.            */
/* -------------------------------------------------------------------------- */

type Json = Record<string, unknown>;

function obj(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
}

/** Trimmed string, or `undefined` if absent/blank — so `??` chains behave. */
function str(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => str(entry)).filter((entry): entry is string => !!entry);
}

/** Accepts `#rgb`/`#rrggbb` only — the value is interpolated into CSS. */
function hexColor(value: unknown, fallback: string): string {
  const candidate = str(value);
  return candidate && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate)
    ? candidate
    : fallback;
}

/* -------------------------------------------------------------------------- */
/* Site settings (brand + contact + socials + footer)                         */
/* -------------------------------------------------------------------------- */

const SOCIAL_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "X",
  instagram: "Instagram",
  dribbble: "Dribbble",
};

/**
 * The admin stores socials in two places with different shapes: an array of
 * `{label, url, isVisible}` on `hero_content.content.socials`, and a keyed
 * object on `hero_content.footer_json.socials`. Merge both, keyed by platform,
 * with the array winning since that editor is the newer one.
 */
function normaliseSocials(fromContent: unknown, fromFooter: unknown): SocialLink[] {
  const merged = new Map<string, SocialLink>();

  for (const [key, value] of Object.entries(obj(fromFooter))) {
    const url = str(value);
    if (!url) continue;
    merged.set(key.toLowerCase(), {
      id: key.toLowerCase(),
      label: SOCIAL_LABELS[key.toLowerCase()] ?? key,
      url,
    });
  }

  if (Array.isArray(fromContent)) {
    for (const entry of fromContent) {
      const record = obj(entry);
      if (record.isVisible === false) continue;
      const url = str(record.url);
      const label = str(record.label);
      if (!url || !label) continue;
      const id = label.toLowerCase();
      merged.set(id, { id, label: SOCIAL_LABELS[id] ?? label, url });
    }
  }

  return [...merged.values()];
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const [brandRes, configRes] = await Promise.all([
    supabaseServer
      .from("site_config")
      .select("content")
      .eq("id", "brand_identity")
      .maybeSingle(),
    supabaseServer
      .from("site_config")
      .select("content, footer_json")
      .eq("id", "hero_content")
      .maybeSingle(),
  ]);

  const brandRow = obj(brandRes.data?.content);
  const brandInner = obj(brandRow.brand);
  const config = obj(configRes.data?.content);
  const footer = obj(configRes.data?.footer_json);

  const accentColor = hexColor(brandRow.accentColor, brandDefaults.accentColor);
  const name = str(brandInner.studio_name) ?? str(config.brand_name) ?? siteName;

  const brand: Brand = {
    name,
    logoUrl: resolveStorageUrl(str(brandInner.logo_url)),
    logoInitial: (str(brandInner.logo_initial) ?? name).charAt(0).toUpperCase(),
    faviconUrl: resolveStorageUrl(str(brandInner.favicon_url)),
    accentColor,
  };

  const contact: ContactInfo = {
    // Footer editor first, like every other field here. `contact_email` is the
    // legacy location written by an older editor; keeping it as a fallback means
    // a fresh row still resolves, but a value saved in /admin/footer now wins
    // instead of being shadowed by a stale `content.contact_email`.
    email:
      str(footer.email) ?? str(config.contact_email) ?? contactDefaults.email,
    phone: str(config.contact_phone) ?? null,
    location:
      str(footer.location) ??
      str(config.hero_location) ??
      str(config.location) ??
      contactDefaults.location,
    timezone:
      str(footer.timezone) ?? str(config.timezone) ?? contactDefaults.timezone,
    availability:
      str(footer.availability) ??
      str(config.availability) ??
      contactDefaults.availability,
    responseTime: str(config.response_time) ?? contactDefaults.responseTime,
  };

  return {
    brand,
    contact,
    socials: normaliseSocials(config.socials, footer.socials),
    footerNarrative:
      str(footer.narrative) ??
      "Tell us what you're building. We'll come back with an honest view on scope, cost and timeline.",
    copyright: str(footer.copyright) ?? name,
    capabilities: strArray(config.capabilities),
  };
}

export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: [CACHE_TAGS.settings],
  revalidate: ONE_HOUR,
});

/* -------------------------------------------------------------------------- */
/* Inquiry recipient (server-only — never sent to the browser)                 */
/* -------------------------------------------------------------------------- */

/**
 * Where contact form submissions are delivered.
 *
 * Deliberately kept out of `SiteSettings`: that object is serialised into the
 * page for the footer and nav, and the address the studio *receives* on is not
 * necessarily the one it publishes. Editable at /admin/footer.
 *
 * Order: the dedicated admin field, then the public contact address (the common
 * case — you receive where you publish), then `INQUIRY_NOTIFY_TO`, and finally
 * the mailer's own default of the authenticated SMTP mailbox. Returning `null`
 * hands that last decision to `src/lib/mailer.ts`.
 */
async function fetchInquiryRecipient(): Promise<string | null> {
  const { data } = await supabaseServer
    .from("site_config")
    .select("content, footer_json")
    .eq("id", "hero_content")
    .maybeSingle();

  const config = obj(data?.content);
  const footer = obj(data?.footer_json);

  return (
    str(footer.notifyEmail) ??
    str(footer.email) ??
    str(config.contact_email) ??
    str(process.env.INQUIRY_NOTIFY_TO) ??
    null
  );
}

export const getInquiryRecipient = unstable_cache(
  fetchInquiryRecipient,
  ["inquiry-recipient"],
  { tags: [CACHE_TAGS.settings], revalidate: ONE_HOUR },
);

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

async function fetchHeroContent(): Promise<HeroContent> {
  const { data } = await supabaseServer
    .from("site_config")
    .select("content")
    .eq("id", "hero_content")
    .maybeSingle();

  const content = obj(data?.content);

  return {
    eyebrow: str(content.upperLabel) ?? "Product engineering studio",
    titleLead: str(content.mainTitleLine1) ?? "Software teams for companies",
    titleEmphasis: str(content.mainTitleLine2) ?? "that need it shipped properly.",
    subtext:
      str(content.subtext) ??
      "We design and build web and mobile products end to end — clear scope, working software every week, and support after launch.",
  };
}

export const getHeroContent = unstable_cache(fetchHeroContent, ["hero-content"], {
  tags: [CACHE_TAGS.settings],
  revalidate: ONE_HOUR,
});

/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */

async function fetchAboutContent(): Promise<AboutContent> {
  const { data } = await supabaseServer
    .from("site_config")
    .select("content")
    .eq("id", "about_page_content")
    .maybeSingle();

  const content = obj(data?.content);

  return {
    titleLead: str(content.headlineLine1) ?? "How we",
    titleEmphasis: str(content.headlineLine2) ?? "work.",
    subheading:
      str(content.subheading) ??
      "A small studio, deliberately. Senior attention on every project instead of a layer of account management.",
    narrative: str(content.philosophy) ?? "",
    experienceYears: str(content.experienceYears) ?? "",
    // The dashboard uploads the portrait to the `site-assets` bucket.
    portraitUrl: resolveStorageUrl(str(content.imageUrl), "site-assets"),
    capabilities: strArray(content.capabilities),
  };
}

export const getAboutContent = unstable_cache(fetchAboutContent, ["about-content"], {
  tags: [CACHE_TAGS.about],
  revalidate: ONE_HOUR,
});

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

async function fetchTeamContent(): Promise<TeamContent> {
  const { data } = await supabaseServer
    .from("site_config")
    .select("content")
    .eq("id", "team_content")
    .maybeSingle();

  const content = obj(data?.content);
  const rawMembers = Array.isArray(content.members) ? content.members : [];

  const members: TeamMember[] = rawMembers
    .map((entry, index) => {
      const record = obj(entry);
      const name = str(record.name);
      // A member with no name is an incomplete draft row; drop it rather than
      // rendering a blank card on the public site.
      if (!name) return null;

      return {
        id: str(record.id) ?? `member-${index}`,
        name,
        role: str(record.role) ?? "",
        bio: str(record.bio) ?? "",
        photoUrl: resolveStorageUrl(str(record.photo_url)),
        linkedinUrl: str(record.linkedin_url) ?? null,
        githubUrl: str(record.github_url) ?? null,
        orderIndex:
          typeof record.order_index === "number" ? record.order_index : index,
      } satisfies TeamMember;
    })
    .filter((member): member is TeamMember => member !== null)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    heading: str(content.heading) ?? "",
    intro: str(content.intro) ?? "",
    members,
  };
}

export const getTeamContent = unstable_cache(fetchTeamContent, ["team-content"], {
  tags: [CACHE_TAGS.team],
  revalidate: ONE_HOUR,
});

/* -------------------------------------------------------------------------- */
/* Homepage sections: Services / Approach / Engagement                         */
/*                                                                            */
/* Each is one `site_config` row holding `{ heading, items }`. A missing row,  */
/* a missing field, or an empty item list all fall back to the defaults in     */
/* `src/lib/site.ts`, so the section is never blank and never crashes on the   */
/* untrusted CMS JSON.                                                         */
/* -------------------------------------------------------------------------- */

/** Narrows a stored heading object, falling back per field to the section default. */
function heading(
  value: unknown,
  fallback: SectionHeadingContent,
): SectionHeadingContent {
  const row = obj(value);
  return {
    eyebrow: str(row.eyebrow) ?? fallback.eyebrow,
    title: str(row.title) ?? fallback.title,
    lede: str(row.lede) ?? fallback.lede,
  };
}

/**
 * Reads one section row. Returns the raw stored `items` array (loose JSON) plus
 * the narrowed heading; the caller maps items to its own shape. An empty or
 * absent items array yields `null` so the caller substitutes its defaults.
 */
async function fetchSection(
  id: string,
  fallbackHeading: SectionHeadingContent,
): Promise<{ heading: SectionHeadingContent; rawItems: Json[] | null }> {
  const { data } = await supabaseServer
    .from("site_config")
    .select("content")
    .eq("id", id)
    .maybeSingle();

  const content = obj(data?.content);
  const items = Array.isArray(content.items) ? content.items.map(obj) : null;

  return {
    heading: heading(content.heading, fallbackHeading),
    rawItems: items && items.length > 0 ? items : null,
  };
}

async function fetchServicesContent(): Promise<ServicesContent> {
  const { heading: h, rawItems } = await fetchSection(
    "services_content",
    servicesDefaults.heading,
  );

  const items: ServiceItem[] = rawItems
    ? rawItems.map((row, index) => ({
        id: str(row.id) ?? `service-${index}`,
        title: str(row.title) ?? "",
        icon: str(row.icon) ?? "sparkles",
        summary: str(row.summary) ?? "",
        outcome: str(row.outcome) ?? "",
        stack: strArray(row.stack),
      }))
    : servicesDefaults.items.map((item, index) => ({
        ...item,
        id: `service-${index}`,
        stack: [...item.stack],
      }));

  // Drop rows with no title — an untitled service card renders as a blank tile.
  return { heading: h, items: items.filter((item) => item.title) };
}

async function fetchApproachContent(): Promise<ApproachContent> {
  const { heading: h, rawItems } = await fetchSection(
    "approach_content",
    approachDefaults.heading,
  );

  const items: ApproachPhase[] = rawItems
    ? rawItems.map((row, index) => ({
        id: str(row.id) ?? `phase-${index}`,
        title: str(row.title) ?? "",
        duration: str(row.duration) ?? "",
        summary: str(row.summary) ?? "",
        deliverable: str(row.deliverable) ?? "",
      }))
    : approachDefaults.items.map((item, index) => ({ id: `phase-${index}`, ...item }));

  return { heading: h, items: items.filter((item) => item.title) };
}

async function fetchEngagementContent(): Promise<EngagementContent> {
  const { heading: h, rawItems } = await fetchSection(
    "engagement_content",
    engagementDefaults.heading,
  );

  const items: EngagementModel[] = rawItems
    ? rawItems.map((row, index) => ({
        id: str(row.id) ?? `model-${index}`,
        name: str(row.name) ?? "",
        duration: str(row.duration) ?? "",
        summary: str(row.summary) ?? "",
        includes: strArray(row.includes),
      }))
    : engagementDefaults.items.map((item, index) => ({
        ...item,
        id: `model-${index}`,
        includes: [...item.includes],
      }));

  return { heading: h, items: items.filter((item) => item.name) };
}

export const getServicesContent = unstable_cache(
  fetchServicesContent,
  ["services-content"],
  { tags: [CACHE_TAGS.services], revalidate: ONE_HOUR },
);

export const getApproachContent = unstable_cache(
  fetchApproachContent,
  ["approach-content"],
  { tags: [CACHE_TAGS.approach], revalidate: ONE_HOUR },
);

export const getEngagementContent = unstable_cache(
  fetchEngagementContent,
  ["engagement-content"],
  { tags: [CACHE_TAGS.engagement], revalidate: ONE_HOUR },
);

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

function normaliseProject(row: Json): Project {
  const gallery = strArray(row.gallery)
    .map((path) => resolveStorageUrl(path))
    .filter((url): url is string => !!url);

  return {
    id: String(row.id ?? ""),
    title: str(row.title) ?? "Untitled project",
    category: str(row.category) ?? "Product",
    description: str(row.description) ?? "",
    coverImage: resolveStorageUrl(str(row.cover_image)),
    gallery,
    stack: strArray(row.stack),
    liveUrl: str(row.live_link) ?? null,
    apkUrl: str(row.apk_url) ?? null,
    featured: row.featured === true,
    orderIndex: typeof row.order_index === "number" ? row.order_index : 0,
    createdAt: str(row.created_at) ?? null,
  };
}

async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabaseServer
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  // A content-fetch failure should degrade to an empty work section, not a 500.
  if (error) {
    console.error("[content] failed to load projects:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normaliseProject(obj(row))).filter((p) => p.id);
}

export const getProjects = unstable_cache(fetchProjects, ["projects"], {
  tags: [CACHE_TAGS.projects],
  revalidate: ONE_HOUR,
});

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  // Fall back to the most recent work so the homepage is never empty just
  // because nobody has ticked "featured" in the admin yet.
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) ?? null;
}

/**
 * Distinct categories present in the work, for the filter control.
 * Derived from the data rather than hardcoded, so a new category in the admin
 * shows up without a code change.
 */
export async function getProjectCategories(): Promise<string[]> {
  const projects = await getProjects();
  return [...new Set(projects.map((project) => project.category))].sort();
}
