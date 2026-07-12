"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield, Cpu, Layers, Code2, Box } from 'lucide-react';

/**
 * Metadata for core technologies.
 * Descriptions updated to reflect engineering-first language.
 */
const toolMetadata: Record<string, { category: string, desc: string, icon: React.ReactNode }> = {
  "Next.js": {
    category: "Framework",
    desc: "High-performance, server-rendered applications with optimized routing and fast page loads.",
    icon: <Cpu size={14} />
  },
  "Motion Design": {
    category: "Animation",
    desc: "Physics-based interactions and precise, state-driven animation that feels natural.",
    icon: <Layers size={14} />
  },
  "Architectural UI/UX": {
    category: "Design",
    desc: "High-fidelity interface design focused on clarity, hierarchy, and great user experience.",
    icon: <Box size={14} />
  },
  "TypeScript": {
    category: "Language",
    desc: "Strictly typed code ensuring data integrity and a stable, scalable codebase.",
    icon: <Shield size={14} />
  },
  "Tailwind CSS": {
    category: "Styling",
    desc: "Utility-first styling for consistent, responsive, and maintainable interfaces.",
    icon: <Code2 size={14} />
  },
};

interface TechProps {
  data: {
    accentColor?: string;
    capabilities: string[];
  };
}

export default function ArsenalUI({ data }: TechProps) {
  const easeExpo = [0.19, 1, 0.22, 1] as const;
  /* Signal Cyan Fallback */
  const accentColor = data.accentColor || "#38BDF8";
  const dynamicTools = data.capabilities || [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -20 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.8, 
        ease: easeExpo 
      } 
    }
  };

  return (
    <main className="min-h-screen pt-48 pb-40 px-8 md:px-16 lg:px-24 bg-[#334155] overflow-hidden relative font-sans">
      {/* Structural Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Background Signal Pulse */}
      <div 
        className="fixed top-0 right-0 w-[60vw] h-[60vw] blur-[200px] rounded-full pointer-events-none opacity-[0.05]" 
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-32 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="uppercase tracking-[0.4em] text-[10px] font-semibold" style={{ color: accentColor }}>
              Our expertise
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl md:text-[10vw] font-black tracking-tighter leading-[0.8] text-[#F8FAFC] uppercase"
          >
            Core <span className="italic font-serif lowercase font-light" style={{ color: accentColor }}>Stack</span>
          </motion.h1>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#94A3B8]/10 border border-[#94A3B8]/10"
        >
          {dynamicTools.map((toolName, index) => {
            const meta = toolMetadata[toolName] || {
              category: "Tooling",
              desc: "Specialized expertise applied to ship high-quality digital products.",
              icon: <Cpu size={14} />
            };

            return (
              <motion.div
                key={toolName}
                variants={itemVariants}
                className="relative p-12 bg-[#1E293B] group overflow-hidden border border-transparent hover:border-[#38BDF8]/30 transition-all duration-500"
              >
                {/* ID Tag */}
                <div className="flex justify-between items-center mb-16 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="text-[#38BDF8] opacity-50 group-hover:opacity-100 transition-opacity">
                      {meta.icon}
                    </div>
                    <span className="text-[10px] font-mono text-[#94A3B8] tracking-[0.4em] uppercase">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div 
                    className="h-[2px] w-8 bg-[#94A3B8]/20 group-hover:w-12 transition-all" 
                    style={{ backgroundColor: `${accentColor}40` }} 
                  />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-4xl font-black text-[#F8FAFC] mb-4 uppercase tracking-tighter group-hover:translate-x-2 transition-transform">
                    {toolName}
                  </h3>
                  
                  <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#38BDF8] mb-8 font-bold">
                    {meta.category}
                  </p>
                  
                  <p className="text-sm text-[#94A3B8] leading-relaxed font-light group-hover:text-[#F8FAFC] transition-colors">
                    {meta.desc}
                  </p>
                </div>

                {/* Technical Watermark */}
                <span className="absolute -bottom-8 -right-4 text-[#F8FAFC]/[0.02] text-[15rem] font-black select-none pointer-events-none group-hover:text-[#F8FAFC]/[0.05] transition-all font-mono italic">
                  {index + 1}
                </span>

                {/* Scanline Animation Effect on Hover */}
                <div className="absolute inset-0 w-full h-[1px] bg-[#38BDF8]/20 -translate-y-full group-hover:animate-scan pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}