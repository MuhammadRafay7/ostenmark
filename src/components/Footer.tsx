"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Instagram, Linkedin, Mail, ArrowUp, Twitter } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface FooterProps {
  settings?: any;
}

const Footer = ({ settings }: FooterProps) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      if (settings?.footer_json) {
        setData(settings.footer_json);
        return;
      }

      const { data: config, error } = await supabase
        .from('site_config')
        .select('footer_json')
        .eq('id', 'hero_content')
        .single();
      
      if (!error && config) {
        setData(config.footer_json);
      }
    };
    fetchFooterData();
  }, [settings]);

  const footerSource = data || settings?.footer_json;
  
  const studioName = footerSource?.copyright || "LIZA STUDIO";
  const email = footerSource?.email || "hello@liza.studio";
  const location = footerSource?.location || "London, UK";
  const narrative = footerSource?.narrative || "Have a project in mind? Tell us what you're building and we'll get back to you within 24 hours.";
  const availability = footerSource?.availability || "Currently accepting new projects";
  const socials = footerSource?.socials || {};
  
  /* Fallback to Signal Cyan (#38BDF8) */
  const accentColor = settings?.accentColor || "#38BDF8";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: <Github size={16} />, href: socials.github, id: 'github' },
    { icon: <Linkedin size={16} />, href: socials.linkedin, id: 'linkedin' },
    { icon: <Instagram size={16} />, href: socials.instagram, id: 'instagram' },
    { icon: <Twitter size={16} />, href: socials.twitter, id: 'twitter' },
    { icon: <Mail size={16} />, href: email ? `mailto:${email}` : null, id: 'email' }
  ].filter(link => link.href);

  return (
    <footer className="relative z-30 pt-40 pb-12 px-8 md:px-16 bg-[#334155] border-t border-white/5 overflow-hidden font-sans">
      {/* Structural Grid Overlay - Match Global CSS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-[10px] uppercase tracking-[0.4em] font-semibold" style={{ color: accentColor }}>
                Get in touch
              </span>
            </div>

            <Link href="/inquiry" className="group block cursor-pointer">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-[#F8FAFC] uppercase leading-[0.8] mb-10 transition-transform group-hover:-translate-y-1">
                Let&apos;s <span className="italic font-serif lowercase" style={{ color: accentColor }}>build together</span>
              </h2>
              <p className="text-[#CBD5E1] text-sm md:text-base group-hover:text-[#F8FAFC] transition-colors max-w-sm leading-relaxed border-l border-white/10 pl-6">
                {narrative}
              </p>
            </Link>
          </motion.div>

          <div className="flex flex-col items-end gap-6">
            <button 
              onClick={scrollToTop}
              className="group flex flex-col items-center gap-4 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors text-[9px] font-mono uppercase tracking-[0.5em] font-bold"
            >
              <span className="mb-2 tracking-[0.5em] mr-[-0.5em]">Back to top</span>
              <div 
                className="w-14 h-24 bg-[#1E293B] border border-white/10 flex items-center justify-center group-hover:border-[#38BDF8]/50 transition-all relative"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <ArrowUp size={20} style={{ color: accentColor }} />
                </motion.div>
                {/* Technical Corner Accents */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-[#38BDF8]/20" />
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-[#38BDF8]/20" />
              </div>
            </button>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Identity & Geo */}
          <div className="text-[#94A3B8] text-[10px] font-mono tracking-[0.4em] uppercase order-2 md:order-1 text-center md:text-left">
            <span className="text-[#F8FAFC]">© {new Date().getFullYear()} {studioName}</span>
            <span className="mx-4 opacity-10">/</span> 
            {location}
          </div>

          {/* Comms Nodes */}
          <div className="flex justify-center gap-12 order-1 md:order-2">
            {socialLinks.map((social) => (
              <Link 
                key={social.id}
                href={social.href}
                target="_blank"
                className="text-[#94A3B8] transition-all duration-300 hover:-translate-y-1 hover:text-[#38BDF8]"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {social.icon}
              </Link>
            ))}
          </div>

          {/* System Status */}
          <div className="text-[#94A3B8] text-[9px] tracking-[0.5em] font-mono uppercase text-center md:text-right order-3">
            <span style={{ color: accentColor }}>[</span> {availability} <span style={{ color: accentColor }}>]</span> <span className="mx-2 opacity-10">//</span> OS.V.4.0
          </div>
        </div>
      </div>

      {/* Background Signal Glow */}
      <div 
        className="absolute -bottom-40 -right-20 w-[50vw] h-[50vw] blur-[200px] pointer-events-none opacity-[0.03]" 
        style={{ backgroundColor: accentColor }} 
      />
    </footer>
  );
};

export default Footer;