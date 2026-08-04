import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * Revalidate hourly, matching the content cache in `src/lib/content.ts`.
 *
 * Without this the sitemap is generated once at build time and frozen: a case
 * study published through the CMS would be live on the site but absent from
 * `/sitemap.xml` until the next deploy, which is precisely the window in which
 * we most want it crawled.
 */
export const revalidate = 3600;

/**
 * Sitemap covering static routes plus every case study.
 *
 * `/cv` is included but deprioritised, and `/admin/*` is absent by construction
 * (it is also disallowed in robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  const projectDates = projects
    .map((project) => project.createdAt)
    .filter((date): date is string => !!date)
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()));

  /**
   * The most recent case-study date, used as the `lastmod` for the two routes
   * that genuinely change when work is published.
   *
   * The rest of the static routes deliberately carry no `lastmod` at all. The
   * tempting alternative — stamping `new Date()` on every route every time the
   * sitemap regenerates — tells Google that the entire site changed an hour ago,
   * on every crawl, forever. Google's guidance is explicit that a `lastmod` it
   * learns to distrust is ignored wholesale, which would also discard the
   * accurate dates on the case studies below. An absent value costs nothing; a
   * dishonest one costs the signal.
   */
  const latestWork =
    projectDates.length > 0
      ? new Date(Math.max(...projectDates.map((date) => date.getTime())))
      : undefined;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: latestWork,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: latestWork,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${siteUrl}/inquiry`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/philosophy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/tech-stack`, changeFrequency: "monthly", priority: 0.6 },
    // `/cv` is intentionally omitted — it is disallowed in robots.ts as thin,
    // largely duplicate content, so listing it here would contradict that.
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => {
    // Image extension entries, so the case-study photography is eligible for
    // Google Images — a real discovery channel for a portfolio, and one that
    // crawling the page alone does not reliably reach, since the gallery images
    // are lazy-loaded.
    const images = [project.coverImage, ...project.gallery].filter(
      (url): url is string => !!url,
    );

    return {
      url: `${siteUrl}/projects/${project.id}`,
      lastModified: project.createdAt ? new Date(project.createdAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  return [...staticRoutes, ...projectRoutes];
}
