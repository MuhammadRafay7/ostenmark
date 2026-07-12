"use client";

import React from 'react';

/**
 * "Trusted by" client row. Text-based placeholders — swap these names for real
 * client wordmarks (or replace the spans with <Image> logos) when available.
 */
const clients: string[] = ["ELKER", "TRIPPLI", "EDG STUDIO", "AMAZELAW", "WRNS", "KIVA"];

interface ClientLogosProps {
  accentColor?: string;
}

export default function ClientLogos({ accentColor = "#38BDF8" }: ClientLogosProps) {
  return (
    <section className="relative z-20 bg-[#334155] px-6 md:px-12 py-16 border-b border-[#94A3B8]/10">
      <div className="max-w-[1400px] mx-auto">
        <p
          className="text-center text-[10px] font-mono uppercase tracking-[0.5em] mb-10"
          style={{ color: accentColor }}
        >
          Trusted by teams building the future
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-20">
          {clients.map((client) => (
            <span
              key={client}
              className="text-lg md:text-2xl font-black tracking-tighter text-[#94A3B8]/50 hover:text-[#F8FAFC] transition-colors duration-500 select-none uppercase"
            >
              {client}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
