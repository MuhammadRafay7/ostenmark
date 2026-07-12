"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

interface NavbarProps {
  settings: {
    brand?: { 
      studio_name: string; 
      logo_url?: string;
      logo_initial?: string;
    };
    accentColor?: string;
    socials?: Array<{ label: string, url: string }>;
  };
}

export default function Navbar({ settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef(null);

  // --- SYNCED DATA LOGIC (FIXED TYPES) ---
  const brand = settings?.brand || { studio_name: "STUDIO" };
  const name = brand.studio_name;
  const logoImage = brand.logo_url;
  const logoInitial = brand.logo_initial || name.charAt(0);
  const accentColor = settings?.accentColor || "#f59e0b";

  // MAGNETIC LOGO LOGIC
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const dX = useSpring(mouseX, springConfig);
  const dY = useSpring(mouseY, springConfig);

  const handleMagnetic = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x * 0.35);
    mouseY.set(y * 0.35);
  };

  const resetMagnetic = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Our Work", href: "/projects" },
    { name: 'About', href: '/philosophy' },
    { name: 'Expertise', href: '/tech-stack' },
    { name: 'Contact', href: '/inquiry' },
  ];

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-[120] transition-all duration-1000 ${
          scrolled ? "py-4" : "py-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          
          <motion.div
            style={{ x: dX, y: dY }}
            onMouseMove={handleMagnetic}
            onMouseLeave={resetMagnetic}
            className="relative z-[130]"
          >
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative h-12 w-12 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white border border-white/10 shadow-sm transition-colors duration-500">
                  {logoImage ? (
                    <Image
                      src={logoImage}
                      alt={`${name} Logo`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                  ) : (
                    <span className="text-black font-bold text-xs uppercase">{logoInitial}</span>
                  )}
                </div>

                <div 
                  className="absolute inset-0 rounded-full border scale-125 group-hover:scale-110 transition-all duration-700 opacity-0 group-hover:opacity-100" 
                  style={{ borderColor: accentColor.startsWith('#') ? `${accentColor}4D` : '#f59e0b4D' }} 
                />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.4em] text-white uppercase leading-none">
                  {name}<span style={{ color: accentColor }}>.</span>
                </span>
                <span className="text-[7px] tracking-[0.5em] text-gray-500 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-1">
                  Studio — 2026
                </span>
              </div>
            </Link>
          </motion.div>

          <div className={`hidden md:flex items-center gap-2 px-2 py-2 rounded-full transition-all duration-700 ${
            scrolled ? "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl" : "bg-transparent"
          }`}>
            {!mobileMenuOpen && navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="px-6 py-2 relative text-[9px] uppercase tracking-[0.3em] font-bold"
                >
                  <span className={`relative z-10 transition-colors duration-500 ${isActive ? "text-white" : "text-gray-500 hover:text-white"}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-inner"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-8">
            <Link 
              href="/inquiry" 
              className="hidden lg:flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-bold group"
            >
              <span className="text-gray-400 group-hover:text-white transition-colors">
                <span className="group-hover:text-white transition-colors">Start Project</span>
              </span>
              <div 
                className="w-8 h-[1px] group-hover:w-12 transition-all duration-500" 
                style={{ backgroundColor: accentColor }}
              />
            </Link>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative w-12 h-12 flex flex-col items-center justify-center gap-1.5 z-[150] bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              <motion.div 
                animate={mobileMenuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                className="w-6 h-[1.5px] bg-white rounded-full origin-center"
              />
              <motion.div 
                animate={mobileMenuOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                className="w-6 h-[1.5px] bg-white rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 bg-[#0a0a0a] z-[110] flex flex-col justify-center px-10 md:px-20"
          >
            <div 
              className="absolute top-0 right-0 w-1/2 h-full pointer-events-none" 
              style={{ background: `linear-gradient(to left, ${accentColor}05, transparent)` }}
            />
            
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.8em] text-gray-600 mb-4 block ml-2">Navigation</span>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (i * 0.1), duration: 0.8 }}
                >
                  <Link 
                    href={link.href}
                    className="group flex items-center gap-6 text-6xl md:text-8xl font-light tracking-tighter"
                  >
                    <span className="text-gray-800 transition-colors duration-500 italic font-serif text-4xl leading-none group-hover:text-white" style={{ color: `${accentColor}80` }}>
                       0{i + 1}
                    </span>
                    <span className={`transition-all duration-700 ${
                      pathname === link.href ? "text-white italic underline decoration-1 underline-offset-8" : "text-gray-500 hover:text-white hover:pl-8"
                    }`}>
                      {link.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-20 left-10 md:left-20 flex flex-col md:flex-row gap-10 md:gap-40"
            >
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 mb-4">Connect</p>
                <div className="flex gap-6 text-xs text-white uppercase tracking-widest">
                  {settings.socials?.map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors opacity-60 hover:opacity-100">{s.label}</a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}