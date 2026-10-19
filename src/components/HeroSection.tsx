import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, FileText, Github, Linkedin, Mail } from 'lucide-react';
import TextPressure from './TextPressure';
import { personalInfo } from '../data/portfolioData';
import heroPortrait from '../assets/images/hero_portrait_final.png';
import heroMountainBottom from '../assets/images/hero_mountain_bottom.png';

interface HeroSectionProps {
  isEntered?: boolean;
  onViewWork: () => void;
  onConnect: () => void;
  onOpenResume?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isEntered = true,
  onViewWork,
  onConnect,
  onOpenResume,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const techTags = ['Java', 'AI / ML', 'Web Development', 'Systems'];

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-between pt-[76px] sm:pt-[86px] lg:pt-[96px] pb-6 sm:pb-8 px-4 sm:px-8 md:px-12 lg:px-16 mx-auto overflow-hidden select-none bg-[#050507] text-[#f4f4f5]"
    >
      {/* ── 1. CINEMATIC DARK VOLCANIC BACKDROP ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Ambient magma glow behind left typography */}
        <div
          className="absolute top-[28%] left-[10%] w-[650px] h-[550px] rounded-full blur-[140px] opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(223, 80, 53, 0.45) 0%, rgba(184, 56, 34, 0.12) 50%, transparent 75%)',
          }}
        />

        {/* Bottom Volcanic Mountain Ridge with Magma Cracks */}
        <img
          src={heroMountainBottom}
          alt=""
          className="absolute bottom-0 left-0 w-full h-[140px] sm:h-[180px] lg:h-[220px] object-cover object-bottom opacity-55 mix-blend-screen pointer-events-none -z-10"
        />

        {/* Ambient technical fine crosshair markers */}
        <div className="absolute top-[18%] left-[4%] text-zinc-600 font-mono text-xs opacity-30 select-none">
          +
        </div>
        <div className="absolute top-[52%] left-[48%] text-zinc-600 font-mono text-xs opacity-30 select-none">
          +
        </div>
      </div>

      {/* ── 2. TWO-COLUMN HERO STAGE (MATCHING EXACT MOCKUP) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
        
        {/* ── LEFT COLUMN: TYPOGRAPHY, BUTTONS & TECH PILLS ── */}
        <div className="lg:col-span-7 flex flex-col items-start justify-center text-left pt-4 sm:pt-6 lg:pt-0">
          
          {/* Eyebrow: ● SOFTWARE ENGINEER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2.5 font-mono text-xs sm:text-[13px] tracking-[0.28em] text-zinc-400 uppercase font-semibold mb-2 sm:mb-3"
          >
            <span className="w-2 h-2 rounded-full bg-[#df5035] shadow-[0_0_8px_#df5035] animate-pulse" />
            <span>SOFTWARE ENGINEER</span>
          </motion.div>

          {/* Heading: NITHISH with Interactive TextPressure Variable Font */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={isEntered ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 15 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[560px] h-[130px] sm:h-[160px] md:h-[185px] relative overflow-visible my-1"
          >
            {/* Fiery volcanic text back-glow */}
            <div
              className="absolute -inset-4 rounded-3xl blur-2xl opacity-80 pointer-events-none -z-10"
              style={{
                background: 'radial-gradient(ellipse 90% 80% at 35% 50%, rgba(223,80,53,0.55) 0%, rgba(199,62,36,0.18) 60%, transparent 85%)',
              }}
            />
            <TextPressure
              text="NITHISH"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ffffff"
              strokeColor="#df5035"
              minFontSize={42}
              align="left"
              className="drop-shadow-[0_0_30px_rgba(223,80,53,0.7)]"
            />
          </motion.div>

          {/* Subtitle / Bio Statement */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-base sm:text-lg md:text-[19px] text-zinc-300 font-sans leading-relaxed max-w-xl mt-3 sm:mt-4 text-balance font-normal"
          >
            I build <span className="text-white font-medium">scalable systems</span> and <span className="text-white font-medium">intuitive digital experiences</span> that turn ideas into <span className="text-[#df5035] font-semibold">real-world impact.</span>
          </motion.p>

          {/* Action Buttons: View My Work & Resume */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex items-center flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {/* Primary: View My Work ↗ */}
            <button
              type="button"
              onClick={onViewWork}
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#e35639] via-[#df5035] to-[#c73e24] text-white font-mono text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2 shadow-[0_0_24px_rgba(223,80,53,0.45)] hover:shadow-[0_0_35px_rgba(223,80,53,0.7)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>View My Work</span>
              <ArrowUpRight size={16} />
            </button>

            {/* Secondary: Resume */}
            {onOpenResume && (
              <button
                type="button"
                onClick={onOpenResume}
                className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-[#121217]/90 border border-white/12 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2 hover:border-white/25 hover:bg-[#181820] transition-all cursor-pointer backdrop-blur-md shadow-sm"
              >
                <FileText size={15} className="text-zinc-400" />
                <span>Resume</span>
              </button>
            )}
          </motion.div>

          {/* Technology Capsule Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex items-center flex-wrap gap-2.5 sm:gap-3 mt-6 sm:mt-8"
          >
            {techTags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full bg-[#121217]/90 border border-white/10 text-xs font-mono text-zinc-300 font-medium tracking-wide shadow-sm hover:border-[#df5035]/40 transition-colors"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Scroll to Explore Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-3.5 mt-8 sm:mt-12 text-[10px] font-mono tracking-[0.24em] text-zinc-400 uppercase select-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-[1.5px] h-6 bg-gradient-to-b from-transparent to-[#df5035]" />
              <span className="w-2 h-2 rounded-full bg-[#df5035] shadow-[0_0_8px_#df5035] animate-pulse" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-zinc-300 font-semibold">SCROLL</span>
              <span className="text-zinc-500">TO EXPLORE</span>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN: PORTRAIT WITH MOUNTAIN & CIRCULAR MAGMA ARC ── */}
        <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end h-full min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]">
          
          {/* Volcanic Magma Arc & Mountain Silhouette Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={isEntered ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.96, x: 20 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[480px] lg:max-w-[540px] flex items-end justify-center lg:justify-end"
          >
            {/* Ambient Backlight Halo behind head and arc */}
            <div
              className="absolute top-[10%] right-[10%] w-[360px] sm:w-[450px] h-[360px] sm:h-[450px] rounded-full blur-[100px] pointer-events-none -z-10 opacity-70"
              style={{
                background: 'radial-gradient(circle, rgba(223, 80, 53, 0.45) 0%, rgba(184, 56, 34, 0.15) 55%, transparent 75%)',
              }}
            />

            {/* Nithish Portrait with Magma Arc & Mountains */}
            <img
              src={heroPortrait}
              alt="Nithish S"
              className="w-full h-auto max-h-[580px] sm:max-h-[640px] object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
              loading="eager"
            />
          </motion.div>

          {/* Far Right Floating Social Networks Dock */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={isEntered ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden lg:flex absolute -right-8 xl:-right-12 top-[35%] -translate-y-1/2 flex-col items-center gap-4 z-20"
          >
            <a
              href={personalInfo.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="w-8 h-8 rounded-full bg-[#121217]/90 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#df5035] hover:scale-110 transition-all shadow-sm"
            >
              <Github size={15} />
            </a>
            <a
              href={personalInfo.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="w-8 h-8 rounded-full bg-[#121217]/90 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#df5035] hover:scale-110 transition-all shadow-sm"
            >
              <Linkedin size={15} />
            </a>
            <a
              href={`mailto:${personalInfo.contact.email}`}
              aria-label="Send Email"
              className="w-8 h-8 rounded-full bg-[#121217]/90 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#df5035] hover:scale-110 transition-all shadow-sm"
            >
              <Mail size={15} />
            </a>

            {/* Technical dotted indicator */}
            <div className="flex flex-col items-center gap-1.5 mt-2 opacity-40">
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
