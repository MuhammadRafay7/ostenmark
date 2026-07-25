import type { Metadata } from "next";

import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";
import type { ContactInfo, Project, SiteSettings } from "@/lib/types";

/**
 * Metadata and structured-data helpers.
 *
 * The previous site exported no metadata at all: no titles, no descriptions, no
 * OpenGraph, no canonical URLs. For a studio whose pipeline depends on being
 * found and on links previewing correctly when a prospect forwards them
 * internally, that was the single largest gap. Everything here exists to close it.
 */

interface PageMetaInput {
  title: string;
  description: string;
  /** Path with leading slash, e.g. `/projects`. Used for the canonical URL. */
  path: string;
  /** Absolute URL of a bespoke social image; falls back to the generated one. */
  image?: string | null;
  /** Set for pages that must not be indexed (e.g. thin utility routes). */
  noIndex?: boolean;
}

/**
 * Builds a complete metadata object for a page.
 *
 * Always sets a canonical URL — without one, the filtered query-string variants
 * of the work index would compete with each other in search results.
 *
 * The social image is always set explicitly, defaulting to the site-wide card.
 * Relying on Next's file-based `opengraph-image` inheritance does not work here:
 * once a page exports its own `openGraph` object, the inherited file-based image
 * is not merged into it, so pages fall through with no `og:image` at all. Routes
 * that generate their own card — currently the case studies — pass `image`
 * pointing at their own `opengraph-image` route.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetaInput): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = image ?? `${siteUrl}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName,
      locale: "en",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* JSON-LD structured data                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `ProfessionalService` rather than `Organization`: it is a subtype that carries
 * the service-area and offer-catalogue fields that matter for a studio selling
 * across borders, and search engines treat it as an organisation regardless.
 */
export function organizationSchema(settings: SiteSettings) {
  const { brand, contact, socials } = settings;

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    alternateName: siteName,
    url: siteUrl,
    description: siteDescription,
    slogan: siteTagline,
    ...(brand.logoUrl ? { logo: brand.logoUrl, image: brand.logoUrl } : {}),
    email: contact.email,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    // Signals to search that this is not a locally-bounded business.
    areaServed: { "@type": "Place", name: "Worldwide" },
    availableLanguage: [{ "@type": "Language", name: "English" }],
    knowsAbout: settings.capabilities.length > 0 ? settings.capabilities : undefined,
    sameAs: socials.map((social) => social.url),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contact.email,
      ...(contact.phone ? { telephone: contact.phone } : {}),
      areaServed: "Worldwide",
      availableLanguage: "English",
    },
  };
}

export function websiteSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: settings.brand.name,
    description: siteDescription,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en",
  };
}

/** Case-study schema. Cast as `CreativeWork` — it is a portfolio piece. */
export function projectSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteUrl}/projects/${project.id}#work`,
    name: project.title,
    headline: project.title,
    description: project.description,
    url: `${siteUrl}/projects/${project.id}`,
    ...(project.coverImage ? { image: project.coverImage } : {}),
    ...(project.createdAt ? { dateCreated: project.createdAt } : {}),
    genre: project.category,
    keywords: project.stack.join(", "),
    creator: { "@id": `${siteUrl}/#organization` },
    provider: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en",
  };
}

/**
 * Breadcrumbs give search engines the site hierarchy and produce the path
 * display in results instead of a bare URL.
 */
export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}

/** An ordered list of case studies, so the work index can be understood as a set. */
export function workCollectionSchema(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/projects#collection`,
    name: "Selected work",
    url: `${siteUrl}/projects`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/projects/${project.id}`,
        name: project.title,
      })),
    },
  };
}

export function contactPageSchema(contact: ContactInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}/inquiry#page`,
    url: `${siteUrl}/inquiry`,
    name: "Start a project",
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contact.email,
      areaServed: "Worldwide",
    },
  };
}
