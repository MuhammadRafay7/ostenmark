"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * "How we work" — the client engagement process. This is the section that
 * distinguishes an agency (a team you hire, with a repeatable process) from a
 * personal portfolio. Static content — edit the steps here.
 */
const steps: Array<{ step: string; title: string; desc: string }> = [
  {
    step: "01",
    title: "Discover",
    desc: "We start with a deep dive into your goals, users, and constraints — then agree on scope, timeline, and success metrics.",
  },
  {
    step: "02",
    title: "Design",
    desc: "We map the product and design the interface, validating direction with you early and often before a line of code is written.",
  },
  {
    step: "03",
    title: "Build",
    desc: "Our engineers ship in focused iterations with regular demos, so you see real, working software throughout the project.",
  },
  {
    step: "04",
    title: "Launch & Support",
    desc: "We deploy, monitor, and refine — and stay on to support and grow the product after it goes live.",
  },
];

interface ProcessProps {
  accentColor?: string;
}

export default function Process({ accentColor = "#38BDF8" }: ProcessProps) {
  return (
    <section className="relative z-20 bg-[#1E293B] px-6 md:px-12 py-32 md:py-40 overflow-hidden border-y border-[#94A3B8]/10">
      <div
        className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] blur-[200px] rounded-full pointer-events-none opacity-[0.05]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-20 md:mb-28 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span
              className="uppercase tracking-[0.4em] text-[10px] font-semibold"
              style={{ color: accentColor }}
            >
              How we work
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] text-[#F8FAFC] uppercase">
            A partnership,{" "}
            <span className="italic font-serif lowercase font-light" style={{ color: accentColor }}>
              start to finish
            </span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl text-sm md:text-base leading-relaxed font-light pt-2">
            A clear, collaborative process that keeps you involved at every stage —
            no surprises, no black boxes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#94A3B8]/10 border border-[#94A3B8]/10">
          {steps.map((s, index) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="relative bg-[#1E293B] p-10 md:p-12 group hover:bg-[#334155]/40 transition-colors duration-500"
            >
              <div
                className="text-5xl md:text-6xl font-black tracking-tighter mb-8"
                style={{ color: `${accentColor}33` }}
              >
                {s.step}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#F8FAFC] uppercase tracking-tighter mb-4">
                {s.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed font-light group-hover:text-[#CBD5E1] transition-colors">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
