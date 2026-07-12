'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PhilosophyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pageRes, brandRes] = await Promise.all([
          supabase.from('site_config').select('content').eq('id', 'about_page_content').single(),
          supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle()
        ]);

        if (pageRes.data?.content) {
          const content = pageRes.data.content;
          
          setData({
            ...content,
            headlineLine1: content.headlineLine1 || "WHO",
            headlineLine2: content.headlineLine2 || "WE ARE",
            subheading: content.subheading || "",
            narrative: content.philosophy || "", 
            experienceYears: content.experienceYears || "0",
            aboutImage: content.imageUrl || null, 
            capabilities: content.capabilities || [],
            /* Defaulting to The Signal (#38BDF8) */
            accentColor: content.accentColor || brandRes.data?.content?.accentColor || "#38BDF8",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 120]), 
    { stiffness: 50, damping: 20 }
  );

  const maskReveal = {
    initial: { y: "100%" },
    animate: { y: "0%" },
  };

  /* Hex Constants for Reference */
  const canvas = "#334155";
  const surface = "#1E293B";
  const ink = "#F8FAFC";
  const highlight = "#94A3B8";
  const signal = "#38BDF8";

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[#334155] overflow-hidden font-sans">
      
      {/* Engineered Technical Glow */}
      <div 
        className="fixed top-[-10%] right-[-5%] w-[50vw] h-[50vw] blur-[150px] pointer-events-none opacity-10 transition-colors duration-1000" 
        style={{ backgroundColor: data?.accentColor || signal }} 
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center font-mono z-50 bg-[#334155]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-[1px] bg-[#38BDF8] animate-pulse" />
              <span className="text-[10px] text-[#38BDF8] tracking-[0.4em] uppercase">Loading</span>
            </div>
          </motion.div>
        ) : !data ? (
          <div className="min-h-screen flex items-center justify-center text-[#94A3B8] text-[10px] uppercase tracking-[0.4em]">
            Content coming soon
          </div>
        ) : (
          <motion.div 
            key="content" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-[1400px] mx-auto px-8 md:px-16 pt-56 pb-40 relative z-10"
          >
            <header className="mb-40">
              <div className="flex items-center gap-4 mb-10">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: 40 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 1 }} 
                  className="h-[2px]" 
                  style={{ backgroundColor: data.accentColor }} 
                />
                <span className="uppercase tracking-[0.5em] text-[10px] font-semibold" style={{ color: data.accentColor }}>
                  About us
                </span>
              </div>
              
              <h1 className="text-[10vw] md:text-[8.5vw] font-black leading-[0.8] tracking-tighter uppercase text-[#F8FAFC] break-words">
                <div className="overflow-hidden pb-2">
                  <motion.span className="block" variants={maskReveal} initial="initial" animate="animate" transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}>
                    {data.headlineLine1}
                  </motion.span>
                </div>
                <div className="overflow-hidden pb-4">
                  <motion.span className="block" style={{ color: data.accentColor }} variants={maskReveal} initial="initial" animate="animate" transition={{ delay: 0.15, duration: 1.2 }}>
                    {data.headlineLine2}
                  </motion.span>
                </div>
              </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 items-start">
              <div className="lg:col-span-7 space-y-20">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                  <h2 className="text-3xl md:text-5xl font-light text-[#F8FAFC] leading-[1.1] tracking-tighter uppercase">
                    {data.subheading}
                  </h2>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} 
                  whileInView={{ opacity: 1 }} 
                  className="relative aspect-[16/9] w-full overflow-hidden bg-[#1E293B] border border-[#38BDF8]/20 grayscale hover:grayscale-0 transition-all duration-1000 group"
                >
                  {data.aboutImage ? (
                    <Image 
                      src={data.aboutImage} 
                      alt="Philosophy Portfolio" 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E293B]">
                       <span className="text-[9px] uppercase tracking-[0.4em] text-[#94A3B8]">Image coming soon</span>
                    </div>
                  )}
                  {/* Internal Blueprint Border Effect */}
                  <div className="absolute inset-0 border-[1px] border-[#38BDF8]/10 pointer-events-none" />
                </motion.div>

                <div className="space-y-10 text-[#CBD5E1] text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                  <p>{data.narrative}</p>
                </div>
              </div>

              <motion.aside style={{ y: smoothY }} className="lg:col-span-5 space-y-16 lg:pl-16 relative mt-20 lg:mt-0">
                {/* Vertical Technical Divider */}
                <div className="hidden lg:block absolute left-0 top-0 w-[0.5px] h-full bg-[#94A3B8]/20" />
                
                <div className="space-y-10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#38BDF8] font-semibold">What we do</p>
                  <ul className="space-y-4">
                    {data.capabilities?.length > 0 ? data.capabilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-6 group border-b border-[#94A3B8]/10 pb-4">
                        <span className="text-[10px] font-mono" style={{ color: data.accentColor }}>[0{i+1}]</span>
                        <span className="text-sm uppercase tracking-[0.3em] text-[#94A3B8] group-hover:text-[#F8FAFC] transition-all">{item}</span>
                      </li>
                    )) : (
                      <li className="text-[10px] text-[#94A3B8] uppercase tracking-widest italic">Coming soon</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#94A3B8] font-semibold">Track record</p>
                  <div className="flex items-end gap-3">
                    <span className="text-9xl font-black text-[#F8FAFC] leading-none tabular-nums">
                      {data.experienceYears}
                    </span>
                    <div className="pb-2 text-[#94A3B8]">
                       <p className="text-[9px] uppercase tracking-widest leading-tight">Years in</p>
                       <p className="text-[9px] uppercase tracking-widest leading-tight text-[#38BDF8]">Business</p>
                    </div>
                  </div>
                </div>

                {/* Start a project — routes prospective clients to the inquiry form */}
                <div className="space-y-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#94A3B8] font-bold">Work With Us</p>
                  <Link
                    href="/inquiry"
                    className="group inline-flex items-center justify-between gap-6 w-full px-6 py-5 bg-[#1E293B] border border-[#94A3B8]/20 hover:border-[#38BDF8]/50 transition-all"
                  >
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#F8FAFC]">Start a Project</span>
                    <ArrowUpRight size={16} style={{ color: data.accentColor }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}