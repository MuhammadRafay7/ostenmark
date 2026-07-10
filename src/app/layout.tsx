import { Montserrat, Playfair_Display } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import ClientLayout from './ClientLayout';
import { Analytics } from '@vercel/analytics/next';
import '@/app/globals.css';
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  display: 'swap', 
  weight: ['300', '400', '500', '700'],
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif', 
  style: ['italic', 'normal'],
  display: 'swap',
});

async function getSiteSettings() {
  try {
    const { data } = await supabase
      .from('site_config')
      .select('content')
      .eq('id', 'brand_identity')
      .single();
    return data?.content || {};
  } catch (error) {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`
          ${montserrat.variable} 
          ${playfair.variable} 
          font-sans 
          /* Primary Ink (#F8FAFC) - High contrast typography */
          text-[#F8FAFC] 
          antialiased 
          /* The Signal (#38BDF8) - Primary tech accent for selection */
          selection:bg-[#38BDF8] 
          selection:text-[#1E293B] 
          cursor-default 
          lg:cursor-none
        `}
      >
        <ClientLayout settings={settings}>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}