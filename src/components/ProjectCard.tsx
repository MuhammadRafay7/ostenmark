"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProjectProps {
  project: {
    id: string;
    title: string;
    category: string;
    cover_image: string;
  };
}

export default function ProjectCard({ project }: ProjectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Helper to handle Supabase paths vs external URLs
  const getImageUrl = (path: string) => {
    if (!path) return ""; 
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseSpringX = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseSpringY = useSpring(y, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseSpringY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseSpringX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }} 
      style={{ perspective: '1200px', width: '100%' }}
      className="group"
    >
      <Link href={`/projects/${project.id}`} className="block no-underline">
        <motion.div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden bg-[#1E293B] border border-white/10"
          style={{ 
            aspectRatio: '16/10', // Standardized aspect ratio
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            borderRadius: '0px' // Removed rounding to match your 'Architectural Archive' aesthetic
          }}
          whileHover="hover"
        >
          {/* Technical Grid Overlay */}
          <div 
            className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
          />
          
          <motion.img 
            src={getImageUrl(project.cover_image)} 
            alt={project.title} 
            className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
          />

          {/* Signal Scanline Animation */}
          <motion.div
            variants={{ hover: { y: '100%', transition: { duration: 1.5, repeat: Infinity, ease: "linear" } } }}
            initial={{ y: '-100%' }}
            className="absolute top-0 left-0 w-full h-[1px] bg-[#38BDF8]/60 z-20 pointer-events-none"
          />

          {/* Quick Action Overlay */}
          <div className="absolute top-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
            <div className="bg-[#38BDF8] p-3 text-[#1E293B]">
              <ArrowUpRight size={20} strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        {/* Technical Metadata Area */}
        <div className="py-6 border-b border-white/5 flex justify-between items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              <span className="text-[9px] text-[#94A3B8] tracking-[0.3em] uppercase">
                {project.category}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-[#F8FAFC] uppercase tracking-tighter group-hover:text-[#38BDF8] transition-colors leading-none">
              {project.title}
            </h3>
          </div>

          <div className="text-[10px] text-[#38BDF8] border border-[#38BDF8]/20 px-3 py-1 uppercase tracking-widest hidden md:block">
            Case Study
          </div>
        </div>
      </Link>
    </motion.div>
  );
}