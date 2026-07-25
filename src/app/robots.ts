import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * Detects a non-public deployment: Vercel preview/development builds, and local
 * development.
 *
 * The polarity here is deliberate and worth stating, because getting it backwards
 * is expensive. This returns `true` only on *positive evidence* that the
 * deployment is not public, and the default is therefore to allow indexing.
 *
 * The alternative — requiring positive proof of production before allowing
 * crawlers — reads as more cautious but fails in the worse direction: any host
 * that doesn't set the environment variable we happen to check would emit
 * `Disallow: /` and silently de-index the live site, with nothing in the build
 * output to indicate it. An over-indexed preview is a minor, reversible problem;
 * a de-indexed production site is the exact opposite of what this site is for.
 */
function isNonPublicDeployment() {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") return true;

  // No configured public origin means this isn't serving real traffic.
  return /localhost|127\.0\.0\.1/.test(siteUrl);
}

export default function robots(): MetadataRoute.Robots {
  if (isNonPublicDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The CMS and the printable credentials sheet carry no search value.
        disallow: ["/admin/", "/admin/*", "/api/", "/cv"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
