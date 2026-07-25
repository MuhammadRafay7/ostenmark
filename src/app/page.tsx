import Approach from "@/components/sections/Approach";
import CallToAction from "@/components/sections/CallToAction";
import Engagement from "@/components/sections/Engagement";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import { getFeaturedProjects, getHeroContent, getSiteSettings } from "@/lib/content";

/**
 * Homepage.
 *
 * Note the absence of `export const dynamic = "force-dynamic"` and
 * `revalidate = 0`, which this page previously declared. Together they disabled
 * caching entirely, so every visit — from anywhere in the world — waited on a
 * fresh Supabase round-trip to a single region before the page could start
 * rendering. Caching now lives in `src/lib/content.ts`, tagged so the admin can
 * still publish changes immediately.
 *
 * Section order follows how a prospective client reads a vendor site: what you
 * do → proof → how you work → how to buy → how to start.
 */
export default async function HomePage() {
  const [settings, hero, projects] = await Promise.all([
    getSiteSettings(),
    getHeroContent(),
    getFeaturedProjects(4),
  ]);

  return (
    <>
      <Hero content={hero} contact={settings.contact} />
      <Services />
      <FeaturedWork projects={projects} />
      <Approach />
      <Engagement />
      <CallToAction contact={settings.contact} />
    </>
  );
}
