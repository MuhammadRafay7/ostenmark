import { supabase } from '@/lib/supabase';
import Hero from '@/components/Hero';
import ClientLogos from '@/components/ClientLogos';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  const [heroRes, brandRes, projectsRes] = await Promise.all([
    supabase.from('site_config').select('content').eq('id', 'hero_content').maybeSingle(),
    supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle(),
    supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
  ]);

  const hero = heroRes.data?.content || {
    upperLabel: "Digital Product Studio",
    mainTitleLine1: "WE BUILD",
    mainTitleLine2: "DIGITAL PRODUCTS",
    subtext: "A full-stack studio shipping fast, reliable software for businesses and startups.",
    location: "Remote — Worldwide",
    availability: "Accepting new clients"
  };

  // Unify the hero with the brand accent so it matches the footer/admin/CV.
  hero.accentColor = brandRes.data?.content?.accentColor || hero.accentColor || "#38BDF8";

  return {
    hero,
    projects: projectsRes.data || []
  };
}

export default async function Page() {
  const { hero, projects } = await getHomeData();

  return (
    <main className="min-h-screen relative">
      {/* Hero */}
      <Hero data={hero} />

      {/* Trusted-by client row */}
      <ClientLogos accentColor={hero.accentColor} />

      {/* Agency "what we do" section — syncs to the brand accent color */}
      <Services accentColor={hero.accentColor} />

      {/* Client engagement process — the key "we're an agency" signal */}
      <Process accentColor={hero.accentColor} />

      {/* Featured work grid */}
      <HomeClient
        initialProjects={projects}
        /* heroData={hero} */
      />

      {/* Credibility band */}
      <Stats accentColor={hero.accentColor} />

      {/* Client testimonials */}
      <Testimonials accentColor={hero.accentColor} />
    </main>
  );
}