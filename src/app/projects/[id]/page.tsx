"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Cpu, Layers, ExternalLink, X, ChevronLeft, ChevronRight, Maximize2, Smartphone, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase'; 

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const getImageUrl = (path: string) => {
    if (!path) return ""; 
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  const getDownloadUrl = (path: string) => {
    if (!path) return "#";
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) setProject(data);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (project?.gallery) {
      setActiveImageIndex((prev) => 
        prev !== null ? (prev - 1 + project.gallery!.length) % project.gallery!.length : null
      );
    }
  }, [project?.gallery]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (project?.gallery) {
      setActiveImageIndex((prev) => 
        prev !== null ? (prev + 1) % project.gallery!.length : null
      );
    }
  }, [project?.gallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    if (activeImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeImageIndex, handlePrev, handleNext]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#334155] flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#38BDF8] font-mono text-[10px] tracking-[0.5em] uppercase"
        >
          [ACCESSING_ARCHIVE...]
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#334155] flex items-center justify-center">
        <p className="text-[#F59E0B] font-mono text-[10px] tracking-[0.5em] uppercase border border-[#F59E0B]/30 px-6 py-2">
          ENTRY_NOT_FOUND
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#334155] text-[#F8FAFC] selection:bg-[#38BDF8]/30 overflow-x-hidden font-sans">
      
      <div className="max-w-[1400px] mx-auto px-8 pt-32">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.4em] text-[#94A3B8] hover:text-[#38BDF8] transition-all w-fit group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> [RETURN_TO_ARCHIVE]
        </motion.button>
      </div>

      <section className="relative z-20 bg-[#334155] max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 py-24 border-x border-[#94A3B8]/10">
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[2px] w-8 bg-[#38BDF8]" />
              <span className="text-[#38BDF8] font-mono text-[10px] uppercase tracking-[1em]">
                {project.category}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase break-words max-w-5xl mb-8">
              {project.title}
            </h1>

            <div className="flex items-center gap-3 text-[#38BDF8] pt-4">
              <Layers size={14} />
              <span className="text-[9px] uppercase tracking-[0.4em]">Overview</span>
            </div>
            
            {/* UPDATED: Removed 'uppercase' for professional readability */}
            <p className="text-xl md:text-3xl text-[#F8FAFC] font-light leading-tight whitespace-pre-wrap break-words max-w-3xl tracking-tighter">
              {project.description}
            </p>
          </div>
          <div className="h-[0.5px] w-full bg-[#94A3B8]/20" />
        </div>

        <aside className="lg:col-span-5">
          <div className="p-10 bg-[#1E293B] border border-[#38BDF8]/20 shadow-2xl space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6 text-[#94A3B8]">
                <Cpu size={14} />
                <span className="text-[9px] font-mono uppercase tracking-[0.4em]">TECH_SPECIFICATIONS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.stack?.map((tech: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-[#F8FAFC]/5 border border-[#94A3B8]/20 text-[9px] font-mono uppercase tracking-widest text-[#F8FAFC] hover:border-[#38BDF8] transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               {project.category === "Mobile" && project.apk_url && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#F59E0B]">
                    <Smartphone size={14} />
                    <span className="text-[9px] font-mono uppercase tracking-[0.4em]">OS_BUILD_READY</span>
                  </div>
                  <a 
                    href={getDownloadUrl(project.apk_url)} 
                    download
                    className="flex items-center justify-between p-5 bg-[#F59E0B] text-[#1E293B] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    FETCH_APK_BUILD <Download size={14} />
                  </a>
                </div>
              )}

              {project.live_link && (
                <a 
                  href={project.live_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-transparent border border-[#38BDF8] text-[#38BDF8] text-[10px] font-mono uppercase tracking-[0.4em] hover:bg-[#38BDF8] hover:text-[#1E293B] transition-all duration-500"
                >
                  {project.category === "Mobile" ? "VIEW_ON_STORE" : "DEPLOY_EXPERIENCE"} <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </aside>
      </section>

      {project.gallery && project.gallery.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 pb-40">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.8em] text-[#94A3B8]">VISUAL_DATA_STREAM</h2>
            <div className="h-[0.5px] w-full bg-[#94A3B8]/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.gallery.map((img: string, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => setActiveImageIndex(i)}
                className={`relative overflow-hidden bg-[#1E293B] border border-[#94A3B8]/10 group cursor-pointer ${
                  i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square md:aspect-[16/10]'
                }`}
              >
                <Image 
                  src={getImageUrl(img)} 
                  alt={`Project image ${i}`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#38BDF8]/0 group-hover:bg-[#38BDF8]/5 transition-colors duration-700 flex items-center justify-center border-0 group-hover:border-[8px] border-[#38BDF8]/20 transition-all">
                  <Maximize2 size={32} className="text-[#F8FAFC] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {activeImageIndex !== null && project.gallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#1E293B]/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveImageIndex(null)}
          >
            <button onClick={(e) => handlePrev(e)} className="absolute left-8 p-4 border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#1E293B] transition-all z-[10002]">
              <ChevronLeft size={32} />
            </button>
            <button onClick={(e) => handleNext(e)} className="absolute right-8 p-4 border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#1E293B] transition-all z-[10002]">
              <ChevronRight size={32} />
            </button>

            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
              <motion.div 
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="relative w-full h-full max-h-[85vh] overflow-hidden border border-[#38BDF8]/20 bg-black">
                  <Image 
                    src={getImageUrl(project.gallery[activeImageIndex])} 
                    alt="Gallery preview"
                    fill
                    className="object-contain"
                    sizes="100vw"
                    quality={95}
                    priority
                  />
                  <button 
                    onClick={() => setActiveImageIndex(null)}
                    className="absolute top-6 right-6 text-[#38BDF8] bg-[#1E293B] border border-[#38BDF8]/30 p-2 hover:bg-[#38BDF8] hover:text-[#1E293B] transition-all z-[50]"
                  >
                    <X size={24} />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-32 flex flex-col items-center gap-8 border-t border-[#94A3B8]/10 bg-[#1E293B]">
        <button 
          onClick={() => router.push('/projects')}
          className="group flex flex-col items-center gap-6"
        >
          <span className="text-[10px] font-mono uppercase tracking-[1em] text-[#94A3B8] group-hover:text-[#38BDF8] transition-colors">
            [ARCHIVE_INDEX]
          </span>
          <div className="h-20 w-[1px] bg-gradient-to-b from-[#38BDF8] to-transparent" />
        </button>
      </footer>
    </main>
  );
}