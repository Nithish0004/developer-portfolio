import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-[#e5ded4]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#c4543f] font-bold">01</span>
          <span className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">/ PROFILE</span>
        </div>
        <div className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">
          {personalInfo.metadataTag}
        </div>
      </div>

      {/* Main Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 sm:pt-16">
        {/* Left: Huge Heading */}
        <div className="lg:col-span-4">
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-[#1f1c19] uppercase sticky top-28 select-none"
          >
            ABOUT
          </motion.h2>
        </div>

        {/* Right: Editorial Typography Prose in Tactile Clay Container */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          {/* Lead Paragraph in Clay Surface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="clay-surface p-8 sm:p-10"
          >
            <p className="font-display text-2xl sm:text-3xl md:text-3.5xl text-[#1f1c19] font-medium leading-snug tracking-tight text-balance">
              I&apos;m <span className="font-extrabold text-[#c4543f]">Nithish S</span>, an Information Science Engineering student at{' '}
              <span className="font-semibold text-[#1f1c19]">RV College of Engineering</span>, Bengaluru.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-[#5e5852] font-sans text-base leading-relaxed border-t border-[#ede7de] mt-6">
              <p>
                I enjoy building software products, exploring AI/ML, and understanding how systems work underneath the interface.
              </p>
              <p>
                I care about creating projects that are technically interesting, useful and worth putting into the real world.
              </p>
            </div>
          </motion.div>

          {/* Editorial Specs / Metadata Table in Tactile Clay Inset Wells (Zero-Pill Discipline) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="clay-surface p-5">
              <span className="block text-[11px] font-mono text-[#8a8175] uppercase tracking-widest pb-1 font-semibold">
                DISCIPLINE
              </span>
              <p className="text-sm font-semibold text-[#1f1c19]">
                Information Science &amp; Eng.
              </p>
            </div>

            <div className="clay-surface p-5">
              <span className="block text-[11px] font-mono text-[#8a8175] uppercase tracking-widest pb-1 font-semibold">
                INSTITUTION
              </span>
              <p className="text-sm font-semibold text-[#1f1c19]">
                RV College of Engineering
              </p>
            </div>

            <div className="clay-surface p-5">
              <span className="block text-[11px] font-mono text-[#8a8175] uppercase tracking-widest pb-1 font-semibold">
                LOCATION
              </span>
              <p className="text-sm font-semibold text-[#1f1c19]">
                Bengaluru, India
              </p>
            </div>
          </motion.div>

          {/* Quick Direct Link / Contact Prompt */}
          <div className="pt-2">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="clay-btn inline-flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase px-5 py-3 font-semibold cursor-pointer"
            >
              <span>INQUIRE FOR COLLABORATION OR ROLES</span>
              <ArrowUpRight size={14} className="text-[#c4543f]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
