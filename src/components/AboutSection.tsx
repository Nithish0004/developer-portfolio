import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, GraduationCap, Calendar, MapPin, FileText } from 'lucide-react';
import { personalInfo, timelineData } from '../data/portfolioData';

interface AboutSectionProps {
  onOpenResume?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenResume }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journey'>('overview');

  return (
    <section id="about" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 sm:pb-12 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#df5035] font-bold">01</span>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">/ PROFILE</span>
        </div>

        {/* Tab Switcher: Overview vs Journey */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141418] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider uppercase font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#df5035] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            OVERVIEW
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journey')}
            className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider uppercase font-semibold transition-all cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-[#df5035] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            JOURNEY &amp; EDUCATION
          </button>
        </div>
      </div>

      {/* Main Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 sm:pt-16">
        {/* Left: Huge Heading */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2
              data-ps
              className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-white uppercase select-none"
            >
              ABOUT
            </h2>
            <p className="mt-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {personalInfo.metadataTag}
            </p>
          </div>

          {onOpenResume && (
            <div className="hidden lg:block pt-8">
              <button
                type="button"
                onClick={onOpenResume}
                className="clay-btn inline-flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-300 hover:text-white uppercase px-4 py-2.5 font-semibold cursor-pointer transition-all"
              >
                <FileText size={14} className="text-[#df5035]" />
                <span>FULL CREDENTIALS</span>
                <ArrowUpRight size={12} className="text-zinc-500" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Tabbed Content Container */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 sm:space-y-10"
              >
                {/* Lead Paragraph in Clay Surface */}
                <div className="clay-surface p-8 sm:p-10">
                  <p className="font-display text-2xl sm:text-3xl md:text-3.5xl text-white font-medium leading-snug tracking-tight text-balance">
                    I&apos;m <span className="font-extrabold text-[#df5035]">Nithish S</span>, an Information Science Engineering student at{' '}
                    <span className="font-semibold text-white">RV College of Engineering</span>, Bengaluru.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-zinc-400 font-sans text-base leading-relaxed border-t border-white/[0.08] mt-6">
                    <p>
                      I enjoy building software products, exploring AI/ML, and understanding how systems work underneath the interface.
                    </p>
                    <p>
                      I care about creating projects that are technically interesting, useful and worth putting into the real world.
                    </p>
                  </div>
                </div>

                {/* Editorial Specs / Metadata Table in Tactile Clay Inset Wells */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="clay-surface p-5">
                    <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest pb-1 font-semibold">
                      DISCIPLINE
                    </span>
                    <p className="text-sm font-semibold text-white">
                      Information Science &amp; Eng.
                    </p>
                  </div>

                  <div className="clay-surface p-5">
                    <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest pb-1 font-semibold">
                      INSTITUTION
                    </span>
                    <p className="text-sm font-semibold text-white">
                      RV College of Engineering
                    </p>
                  </div>

                  <div className="clay-surface p-5">
                    <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest pb-1 font-semibold">
                      LOCATION
                    </span>
                    <p className="text-sm font-semibold text-white">
                      Bengaluru, India
                    </p>
                  </div>
                </div>

                {/* Quick Direct Link / Contact Prompt */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#df5035] hover:text-[#ff6542] font-semibold uppercase group transition-colors"
                  >
                    <span>INQUIRE ABOUT COLLABORATION</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  {onOpenResume && (
                    <button
                      type="button"
                      onClick={onOpenResume}
                      className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-zinc-400 hover:text-white uppercase font-semibold transition-colors"
                    >
                      <FileText size={12} className="text-[#df5035]" />
                      <span>VIEW RESUME</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="journey"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {timelineData.map((item, idx) => (
                  <div key={item.id} className="clay-surface p-6 sm:p-7 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-[#df5035]" />
                        <h3 className="font-display font-bold text-base sm:text-lg text-white">
                          {item.title}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-[#df5035] font-semibold">
                        {item.period}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                      <span>{item.institution}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{item.location}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-zinc-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
