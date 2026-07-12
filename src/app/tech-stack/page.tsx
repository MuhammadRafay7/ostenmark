import { supabase } from '@/lib/supabase';
import ArsenalUI from '../../components/ArsenalUI'; 

export const revalidate = 0; // Ensures instant updates for the technical stack

async function getTechData() {
  try {
    // We fetch both the page content and the brand identity for global style syncing
    const [pageRes, brandRes] = await Promise.all([
      supabase.from('site_config').select('content').eq('id', 'about_page_content').single(),
      supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle()
    ]);

    const pageContent = pageRes.data?.content || {};
    const brandContent = brandRes.data?.content || {};

    // Define the "Signal Cyan" as the engineering fallback
    const fallbackAccent = "#38BDF8"; 
    
    // Default stack reflecting the Concrete & Cobalt technical core
    const defaultCapabilities = [
      "Next.js 14", 
      "TypeScript", 
      "Supabase Engineering", 
      "Framer Motion", 
      "Tailwind CSS",
      "Full-Stack Architecture"
    ];

    return {
      accentColor: pageContent.accentColor || brandContent.accentColor || fallbackAccent,
      capabilities: pageContent.capabilities && pageContent.capabilities.length > 0 
        ? pageContent.capabilities 
        : defaultCapabilities
    };

  } catch (error) {
    console.error("SYSTEM_SYNC_ERROR // Critical failure in tech data retrieval:", error);
    
    return {
      accentColor: "#38BDF8",
      capabilities: ["Next.js", "TypeScript", "Tailwind CSS"]
    };
  }
}

export default async function Page() {
  const data = await getTechData();
  
  return (
    /* The ArsenalUI component should handle the transition from 
       the primary canvas (#334155) to the deep surface (#1E293B).
    */
    <ArsenalUI data={data} />
  );
}