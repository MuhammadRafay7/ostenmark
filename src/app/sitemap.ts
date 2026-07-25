import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap covering static routes plus every case study.
 *
 * `/cv` is included but deprioritised, and `/admin/*` is absent by construction
 * (it is also disallowed in robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/inquiry`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/philosophy`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/tech-stack`, changeFrequency: "monthly", priority: 0.6 },
    // `/cv` is intentionally omitted — it is disallowed in robots.ts as thin,
    // largely duplicate content, so listing it here would contradict that.
  ];

  const projects = await getProjects();

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.id}`,
    lastModified: project.createdAt ? new Date(project.createdAt) : undefined,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
