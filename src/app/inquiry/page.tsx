"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Globe, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InquiryPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', vision: '', _honeypot: '' });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('content')
          .eq('id', 'hero_content')
          .single();
        
        if (data?.content) setSettings(data.content);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const contactEmail = settings?.contact_email || "hello@liza.studio";
  const brandName = settings?.brand_name || "LIZA STUDIO";
  const heroTitle = settings?.hero_title || "Let's build *iconic* things.";
  const locationText = settings?.hero_location || "London, UK";

  const renderTitle = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <span key={i} className="text-[#38BDF8] italic font-serif lowercase">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData._honeypot || !formData.name || !formData.email) return;
    setStatus('sending');

    try {
      await supabase.from('inquiries').insert([{ 
        name: formData.name, 
        email: formData.email, 
        message: formData.vision,
        created_at: new Date().toISOString()
      }]);

      const subject = encodeURIComponent(`New inquiry: ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nProject: ${formData.vision}`);
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      
      setStatus('success');
    } catch (err) {
      console.error("Transmission failed", err);
      setStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#334155] flex items-center justify-center">
        <div className="text-[#38BDF8] text-[10px] tracking-[0.4em] animate-pulse uppercase">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-48 pb-20 px-8 md:px-16 bg-[#334155] relative overflow-hidden selection:bg-[#38BDF8]/30 font-sans">
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[2px] bg-[#38BDF8]" />
              <span className="text-[#38BDF8] uppercase tracking-[0.5em] text-[10px] font-semibold">Start a project</span>
            </div>
            <h1 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-[0.85] text-[#F8FAFC] uppercase whitespace-pre-line">
              {renderTitle(heroTitle)}
            </h1>
          </motion.div>
        </header>
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <SuccessState reset={() => { setStatus('idle'); setFormData({name:'', email:'', vision:'', _honeypot:''}); }} />
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <input type="text" className="hidden" value={formData._honeypot} onChange={(e) => setFormData({...formData, _honeypot: e.target.value})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24">
                <InputGroup label="Your name" value={formData.name} onChange={(val: string) => setFormData({...formData, name: val})} placeholder="Jane Doe" />
                <InputGroup label="Email" value={formData.email} onChange={(val: string) => setFormData({...formData, email: val})} placeholder="you@company.com" type="email" />
              </div>

              <div className="group border-b border-[#94A3B8]/20 py-10 focus-within:border-[#38BDF8] transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] group-focus-within:text-[#38BDF8] transition-all">About your project</p>
                  <span className="text-[10px] font-mono text-[#94A3B8]/40">{formData.vision.length} / 500</span>
                </div>
                <textarea 
                  required 
                  maxLength={500} 
                  value={formData.vision} 
                  onChange={(e) => setFormData({...formData, vision: e.target.value})} 
                  className="w-full bg-[#1E293B]/30 outline-none p-6 text-lg md:text-xl font-light text-[#F8FAFC] h-48 md:h-64 resize-none placeholder:text-[#94A3B8]/30 border border-[#94A3B8]/10 group-focus-within:border-[#38BDF8]/30 transition-all"
                  placeholder="Tell us about your project, goals, and timeline…"
                />
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center pt-16 gap-8">
                <div className="flex items-center gap-3">
                   <Zap size={14} className="text-[#38BDF8]" />
                   <p className="text-[#94A3B8] text-[10px] uppercase tracking-[0.2em]">We usually reply within 24 hours</p>
                </div>
                <button 
                  disabled={status === 'sending'} 
                  className="relative w-full md:w-auto px-16 py-6 bg-transparent border border-[#38BDF8] text-[#38BDF8] transition-all hover:bg-[#38BDF8] hover:text-[#1E293B] group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] font-bold">
                    {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <>Send inquiry <ArrowRight size={16} /></>}
                  </span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-16 pt-20 border-t border-[#94A3B8]/10">
          <ContactDetail label="Email" value={contactEmail} subValue={settings?.contact_phone || "+44 (20) 0000 0000"} />
          <ContactDetail label="Location" value={locationText} subValue={<LiveClock />} />
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">{brandName}</p>
            <div className="flex gap-8">
              {settings?.socials?.filter((social: any) => social.isVisible !== false).map((social: any) => (
                <a 
                  key={social.label} 
                  href={social.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#F8FAFC] hover:text-[#38BDF8] transition-all font-mono"
                >
                  [{social.label.toUpperCase()}]
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function InputGroup({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="group border-b border-[#94A3B8]/20 py-10 focus-within:border-[#38BDF8] transition-all duration-500">
      <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#94A3B8] group-focus-within:text-[#38BDF8] transition-all mb-4">{label}</p>
      <input 
        required 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-transparent outline-none text-xl md:text-2xl font-light text-[#F8FAFC] placeholder:text-[#94A3B8]/20 uppercase tracking-tight" 
        placeholder={placeholder} 
      />
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()));
    update();
    const inv = setInterval(update, 60000);
    return () => clearInterval(inv);
  }, []);
  return <span className="flex items-center gap-2 font-mono text-[#94A3B8] uppercase tracking-widest"><Globe size={12} className="text-[#38BDF8]" /> {time} Zulu</span>;
}

function ContactDetail({ label, value, subValue }: any) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#94A3B8]">{label}</p>
      <p className="text-lg font-light text-[#F8FAFC] tracking-tight uppercase">{value}</p>
      <div className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-widest">{subValue}</div>
    </div>
  );
}

function SuccessState({ reset }: { reset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center text-center gap-10 bg-[#1E293B] border border-[#38BDF8]/20">
      <div className="h-20 w-20 flex items-center justify-center border border-[#38BDF8]"><CheckCircle2 size={32} className="text-[#38BDF8]" /></div>
      <div className="space-y-4">
        <h3 className="text-4xl font-black text-[#F8FAFC] uppercase tracking-tighter">Message sent.</h3>
        <p className="text-[11px] text-[#94A3B8] tracking-[0.2em] uppercase">Thanks — we'll be in touch shortly.</p>
      </div>
      <button onClick={reset} className="mt-8 px-10 py-4 border border-[#94A3B8]/30 text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] hover:text-[#38BDF8] hover:border-[#38BDF8] transition-all">
        Send another
      </button>
    </motion.div>
  );
}