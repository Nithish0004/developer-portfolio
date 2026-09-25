import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onViewWork: () => void;
  onConnect: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onViewWork,
  onConnect,
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-12 sm:pb-16 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
      {/* Top Subtle Coordinates / Status Header Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between text-xs font-mono tracking-widest text-[#7a7269] uppercase pb-6 border-b border-[#e5ded4]"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c4543f]" />
          PORTFOLIO // 2025–2026
        </span>
        <span className="hidden sm:inline">BANGALORE, IN [12.9716° N, 77.5946° E]</span>
      </motion.div>

      {/* Main Massive Editorial Typography Anchor */}
      <div className="my-auto py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Giant Expressive Name Heading */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="select-none"
            >
              <h1 className="font-display font-black text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] xl:text-[12rem] tracking-[-0.05em] leading-[0.80] text-[#1f1c19] drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                NITHISH
              </h1>
              <h1 className="font-display font-black text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] xl:text-[12rem] tracking-[-0.05em] leading-[0.80] text-[#8a8175]">
                S
              </h1>
            </motion.div>
          </div>

          {/* Right/Secondary Column: Structured Editorial Intro in Clay Surface */}
          <div className="lg:col-span-4 flex flex-col justify-between lg:pb-3">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="clay-surface p-7 sm:p-8 space-y-6"
            >
              {/* Introduction Title */}
              <div className="space-y-1 border-l-2 border-[#c4543f] pl-4">
                <p className="text-xl sm:text-2xl font-display font-bold text-[#1f1c19] leading-snug tracking-tight">
                  Software Developer
                </p>
                <p className="text-lg sm:text-xl font-display font-medium text-[#7a7269] leading-snug tracking-tight">
                  &amp; ISE Student
                </p>
              </div>

              {/* Mission Statement */}
              <p className="text-sm sm:text-base text-[#5e5852] font-sans leading-relaxed text-balance">
                Building practical software, intelligent systems and products that solve real problems.
              </p>

              {/* Two Tactile Clay Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onViewWork}
                  className="clay-btn-accent inline-flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase px-5 py-3 font-semibold cursor-pointer"
                >
                  <span>VIEW WORK</span>
                  <ArrowDownRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={onConnect}
                  className="clay-btn inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase px-5 py-3 font-semibold cursor-pointer"
                >
                  <span>CONNECT</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hero Bottom: Minimal Scroll Indicator and Metadata Footprint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.4 }}
        className="flex items-center justify-between pt-6 border-t border-[#e5ded4]"
      >
        <div className="text-[11px] font-mono tracking-widest text-[#7a7269] uppercase font-medium">
          RV COLLEGE OF ENGINEERING · BENGALURU
        </div>

        <button
          type="button"
          onClick={onViewWork}
          className="clay-btn flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase cursor-pointer"
          aria-label="Scroll to work"
        >
          <span>SCROLL</span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={13} className="text-[#c4543f]" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
};
