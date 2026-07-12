"use client";

import { usePathname } from 'next/navigation';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({
  children, 
  settings 
}: { 
  children: React.ReactNode;
  settings: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  // Bare routes render without site chrome (nav/footer/frame) — e.g. the printable CV.
  const isBare = isAdmin || pathname === '/cv';

  return (
    <>
      {!isBare && (
        <>
          {/* GLOBAL AESTHETIC OVERLAYS - COMMENTED SECTION 
              (Originally contained grain and vignette for digital experience crafting)
              
              <div className="fixed inset-0 pointer-events-none z-0">
                <div className="bg-grain" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(30,41,59,0.4)_100%)]" />
              </div> 
          */}
          
          {/* Structural Frame - Deep Slate Engineering Grid */}
          <div className="fixed inset-0 pointer-events-none z-[50] hidden md:flex items-center justify-center p-6">
             <div className="w-full h-full border border-[#1E293B]/40" />
          </div>
        </>
      )}

      <div className="flex flex-col min-h-screen bg-[#334155]">
        {!isBare && <Navbar settings={settings} />}

        <main className="flex-grow w-full overflow-x-hidden">
          {children}
        </main>

        {!isBare && <Footer settings={settings} />}
      </div>

      <div id="cursor-portal" />
    </>
  );
}