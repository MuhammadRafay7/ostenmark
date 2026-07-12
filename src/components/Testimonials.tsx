"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

/**
 * Client testimonials. Static placeholder quotes — replace names/quotes here
 * with real client feedback as it comes in.
 */
const testimonials: Array<{ quote: string; name: string; role: string }> = [
  {
    quote:
      "They shipped a polished product faster than any team we'd worked with. Communication was clear the whole way through.",
    name: "Alex Rivera",
    role: "Founder, Elker",
  },
  {
    quote:
      "The engineering quality is exceptional. Everything just works, and the interface feels genuinely premium.",
    name: "Priya Nair",
    role: "Product Lead, Trippli",
  },
  {
    quote:
      "A rare studio that cares about both the code and the details of the experience. We'll be back for the next build.",
    name: "Marcus Vaughn",
    role: "CEO, EDG Studio",
  },
];

interface TestimonialsProps {
  accentColor?: string;
}

export default function Testimonials({ accentColor = "#38BDF8" }: TestimonialsProps) {
  return (
    <section className="relative z-20 bg-[#334155] px-6 md:px-12 py-32 md:py-40 overflow-hidden">
      {/* Structural grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-20 md:mb-28 space-y-6">
          <div className="flex items-center gap-4">
            <Quote size={16} style={{ color: accentColor }} />
            <span
              className="font-mono uppercase tracking-[0.6em] text-[10px] font-bold"
              style={{ color: accentColor }}
            >
              CLIENT FEEDBACK
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] text-[#F8FAFC] uppercase">
            Trusted by{" "}
            <span className="italic font-serif lowercase font-light" style={{ color: accentColor }}>
              teams
            </span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#94A3B8]/10 border border-[#94A3B8]/10">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="bg-[#1E293B] p-10 md:p-12 flex flex-col justify-between gap-10 group hover:border-[#38BDF8]/30 border border-transparent transition-all duration-500"
            >
              <p className="text-base md:text-lg text-[#F8FAFC] leading-relaxed font-light">
                <span className="text-3xl leading-none mr-1" style={{ color: accentColor }}>
                  &ldquo;
                </span>
                {t.quote}
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="h-[2px] w-8 group-hover:w-12 transition-all"
                  style={{ backgroundColor: accentColor }}
                />
                <div>
                  <div className="text-sm font-bold text-[#F8FAFC] tracking-tight">{t.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#94A3B8] mt-1">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
