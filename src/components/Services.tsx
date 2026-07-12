"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Cpu, Layout, Smartphone, Plug } from 'lucide-react';

/**
 * Agency service groupings. Mirrors the Kodo Labs "Expertise" structure
 * (Back-end / Front-end / Mobile / Integrations) but rendered in the
 * studio's dark "system" aesthetic. Static data by design — edit here to
 * change what the agency offers.
 */
const services: Array<{
  category: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  stack: string[];
}> = [
  {
    category: "01",
    title: "Back-end",
    desc: "Scalable, server-rendered infrastructure and robust APIs engineered for reliability under load.",
    icon: <Cpu size={16} />,
    stack: ["Node.js", "Next.js", "PostgreSQL", "Supabase", "Redis"],
  },
  {
    category: "02",
    title: "Front-end",
    desc: "High-fidelity, accessible interfaces with smooth motion and precise, responsive layouts.",
    icon: <Layout size={16} />,
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "03",
    title: "Mobile",
    desc: "Cross-platform apps that ship to iOS and Android from a single, maintainable codebase.",
    icon: <Smartphone size={16} />,
    stack: ["React Native", "Expo", "iOS", "Android"],
  },
  {
    category: "04",
    title: "Integrations",
    desc: "Payments, auth, messaging and third-party services wired into your product end to end.",
    icon: <Plug size={16} />,
    stack: ["Stripe", "Auth", "SendGrid", "Twilio", "Maps"],
  },
];

interface ServicesProps {
  accentColor?: string;
}

export default function Services({ accentColor = "#38BDF8" }: ServicesProps) {
  const easeExpo = [0.19, 1, 0.22, 1] as const;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: easeExpo },
    },
  };

  return (
    <section className="relative z-20 bg-[#334155] px-6 md:px-12 py-32 md:py-40 overflow-hidden">
      {/* Structural grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <header className="mb-20 md:mb-28 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span
              className="uppercase tracking-[0.4em] text-[10px] font-semibold"
              style={{ color: accentColor }}
            >
              What we do
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] text-[#F8FAFC] uppercase">
            Our{" "}
            <span className="italic font-serif lowercase font-light" style={{ color: accentColor }}>
              expertise
            </span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl text-sm md:text-base leading-relaxed font-light pt-2">
            A full-stack studio building fast, reliable software for businesses and
            startups — from architecture to interface.
          </p>
        </header>

        {/* Service grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#94A3B8]/10 border border-[#94A3B8]/10"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="relative p-10 md:p-14 bg-[#1E293B] group overflow-hidden border border-transparent hover:border-[#38BDF8]/30 transition-all duration-500"
              style={{ ['--svc-accent' as string]: accentColor }}
            >
              {/* ID tag */}
              <div className="flex justify-between items-center mb-14 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-mono text-[#94A3B8] tracking-[0.4em] uppercase">
                    {service.category}
                  </span>
                </div>
                <div
                  className="h-[2px] w-8 group-hover:w-12 transition-all"
                  style={{ backgroundColor: `${accentColor}40` }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-6 uppercase tracking-tighter group-hover:translate-x-2 transition-transform">
                  {service.title}
                </h3>

                <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed font-light mb-8 max-w-md group-hover:text-[#F8FAFC] transition-colors">
                  {service.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {service.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 border"
                      style={{
                        color: accentColor,
                        borderColor: `${accentColor}33`,
                        backgroundColor: `${accentColor}0D`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical watermark */}
              <span className="absolute -bottom-8 -right-4 text-[#F8FAFC]/[0.02] text-[13rem] font-black select-none pointer-events-none group-hover:text-[#F8FAFC]/[0.04] transition-all font-mono italic">
                {index + 1}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
