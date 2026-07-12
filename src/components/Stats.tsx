"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Agency credibility band ("Why Work With Us"). Static figures — edit here.
 */
const stats: Array<{ value: string; label: string }> = [
  { value: "100+", label: "Projects Delivered" },
  { value: "40+", label: "Happy Clients" },
  { value: "8+", label: "Years Building" },
  { value: "100%", label: "Positive Feedback" },
];

interface StatsProps {
  accentColor?: string;
}

export default function Stats({ accentColor = "#38BDF8" }: StatsProps) {
  return (
    <section className="relative z-20 bg-[#1E293B] px-6 md:px-12 py-24 md:py-32 overflow-hidden border-y border-[#94A3B8]/10">
      {/* Background signal pulse */}
      <div
        className="absolute top-0 left-1/4 w-[40vw] h-[40vw] blur-[200px] rounded-full pointer-events-none opacity-[0.06]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-16 justify-center md:justify-start">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span
            className="font-mono uppercase tracking-[0.6em] text-[10px] font-bold"
            style={{ color: accentColor }}
          >
            WHY WORK WITH US
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#94A3B8]/10 border border-[#94A3B8]/10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="bg-[#1E293B] p-8 md:p-12 group"
            >
              <div
                className="text-5xl md:text-7xl font-black tracking-tighter text-[#F8FAFC] mb-4 group-hover:translate-x-1 transition-transform"
              >
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-[#94A3B8]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
