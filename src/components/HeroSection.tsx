import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import GlowCursor from './GlowCursor';
import TextPressure from './TextPressure';

interface HeroSectionProps {
  isEntered?: boolean;
  onViewWork: () => void;
  onConnect: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isEntered = true,
  onViewWork,
  onConnect,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);

  // ── SUBTLE VERTICAL PARALLAX SCROLL DRIFT ON HERO TYPOGRAPHY ──
  useEffect(() => {
    let scrollRafId: number | null = null;
    let targetScrollY = 0;
    let currentScrollY = 0;
    let isHeroInView = true;

    const getScrollTop = () => {
      return (
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const updateScrollParallax = () => {
      if (!isHeroInView || document.hidden) {
        scrollRafId = null;
        return;
      }

      const diff = targetScrollY - currentScrollY;
      if (Math.abs(diff) > 0.05) {
        currentScrollY += diff * 0.15;
      } else {
        currentScrollY = targetScrollY;
      }

      const MAX_SAFE_OFFSET = 24;
      const calculatedParallaxY = -Math.max(0, currentScrollY * 0.16);
      const parallaxY = Math.max(-MAX_SAFE_OFFSET, Math.min(0, calculatedParallaxY));

      if (headingRef.current) {
        headingRef.current.style.transform = `translate3d(0, ${parallaxY.toFixed(2)}px, 0)`;
      }

      if (Math.abs(targetScrollY - currentScrollY) > 0.05) {
        scrollRafId = requestAnimationFrame(updateScrollParallax);
      } else {
        scrollRafId = null;
      }
    };

    const onScroll = () => {
      targetScrollY = getScrollTop();
      if (targetScrollY > window.innerHeight + 150) {
        if (scrollRafId) {
          cancelAnimationFrame(scrollRafId);
          scrollRafId = null;
        }
        return;
      }
      if (!scrollRafId && isHeroInView && !document.hidden) {
        scrollRafId = requestAnimationFrame(updateScrollParallax);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? true;
        isHeroInView = inView;
        if (inView && !document.hidden) {
          onScroll();
        } else if (scrollRafId) {
          cancelAnimationFrame(scrollRafId);
          scrollRafId = null;
        }
      },
      { threshold: 0 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (scrollRafId) {
          cancelAnimationFrame(scrollRafId);
          scrollRafId = null;
        }
      } else if (isHeroInView) {
        onScroll();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-between pt-[72px] sm:pt-[82px] lg:pt-[88px] pb-6 sm:pb-8 px-4 sm:px-8 md:px-12 mx-auto overflow-hidden select-none bg-[#070709] text-[#f4f4f5]"
    >
      {/* ── 1. CINEMATIC DARK VOLCANIC BACKDROP WITH CRIMSON MAGMA GLOW & RIDGE TEXTURES ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Deep ambient dark gradient */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#070709',
            backgroundImage: `
              radial-gradient(circle 850px at 62% 45%, rgba(223, 80, 53, 0.14) 0%, rgba(184, 56, 34, 0.05) 45%, transparent 75%),
              radial-gradient(circle 600px at 95% 85%, rgba(223, 80, 53, 0.18) 0%, rgba(184, 56, 34, 0.04) 50%, transparent 80%),
              radial-gradient(circle 500px at 8% 25%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)
            `,
          }}
        />

        {/* Volcanic mountain silhouette & glowing crimson magma fissure on right / center */}
        <svg
          className="absolute right-0 bottom-0 w-full sm:w-[70%] lg:w-[55%] h-[55%] sm:h-[65%] object-cover pointer-events-none opacity-45 mix-blend-screen"
          viewBox="0 0 1000 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="magmaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="volcanoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1f1816" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#0e0c0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#070709" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="lavaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff7b5a" />
              <stop offset="50%" stopColor="#df5035" />
              <stop offset="100%" stopColor="#8f2010" />
            </linearGradient>
          </defs>

          {/* Dark basalt mountain ridges */}
          <path
            d="M200 700 L450 380 L620 480 L820 220 L1000 320 L1000 700 Z"
            fill="url(#volcanoGrad)"
          />
          <path
            d="M380 700 L580 430 L740 510 L940 310 L1000 350 L1000 700 Z"
            fill="#09080b"
            opacity="0.85"
          />

          {/* Glowing volcanic lava veins / fissures (matching mockup) */}
          <path
            d="M450 380 Q560 410 620 480 Q720 360 820 220 Q920 280 1000 320"
            stroke="url(#lavaGrad)"
            strokeWidth="3.5"
            filter="url(#magmaGlow)"
          />
          <path
            d="M580 430 Q680 480 740 510 Q850 400 940 310"
            stroke="#df5035"
            strokeWidth="2"
            opacity="0.75"
            filter="url(#magmaGlow)"
          />
          <path
            d="M620 480 Q690 560 760 620 Q840 650 960 700"
            stroke="#ff5436"
            strokeWidth="2.5"
            opacity="0.6"
            filter="url(#magmaGlow)"
          />
        </svg>

        {/* Ambient technical fine crosshair markers */}
        <div className="absolute top-[22%] left-[6%] text-zinc-600 font-mono text-xs opacity-40 select-none">
          +
        </div>
        <div className="absolute top-[48%] right-[7%] text-zinc-600 font-mono text-xs opacity-40 select-none">
          +
        </div>
        <div className="absolute bottom-[35%] left-[8%] text-[#df5035] font-mono text-xs opacity-60 select-none">
          +
        </div>
      </div>

      {/* ── 2. HERO GLOWCURSOR (OGL/WebGL) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <GlowCursor
          boundRef={sectionRef}
          className="w-full h-full"
          color="#df5035"
          secondaryColor="#ff6542"
          trailLength={35}
          trailWidth={7}
          trailTaper={0.85}
          followSpeed={0.18}
          glowIntensity={1.8}
          glowSpread={1.2}
          hotspot={0.4}
          brightness={1.2}
          opacity={0.85}
          pulseSpeed={0.7}
          noiseStrength={0.02}
          idleFade={true}
          idleTimeout={600}
          fadeDuration={600}
          blendMode="screen"
          maxDevicePixelRatio={1.5}
        />
      </div>

      {/* ── 3. TOP METADATA ROW (MATCHING PROPOSED REDESIGN) ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-start justify-between px-2 sm:px-4 pt-1 sm:pt-2">
        {/* Left Meta: 01 // DEVELOPER + Crosshair */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-1 font-mono select-none"
        >
          <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold tracking-wider">
            01
          </span>
          <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold tracking-widest uppercase">
            // DEVELOPER
          </span>
          <span className="text-[#df5035] text-xs font-mono mt-1 opacity-80">+</span>
        </motion.div>

        {/* Right Meta: BANGALORE, INDIA // OPEN TO OPPORTUNITIES */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-end gap-1 font-mono text-right select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df5035] shadow-[0_0_6px_#df5035]" />
            <span className="text-[11px] sm:text-xs text-zinc-300 font-semibold tracking-wider uppercase">
              BANGALORE, INDIA
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold tracking-widest uppercase">
            // OPEN TO OPPORTUNITIES
          </span>
        </motion.div>
      </div>

      {/* ── 4. CENTER STAGE: NITHISH TYPOGRAPHY + TEXTPRESSURE ANIMATION ── */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center text-center my-auto py-2 sm:py-4">
        {/* Architectural Name with TextPressure Variable Font Interaction */}
        <div
          ref={headingRef}
          aria-label="Nithish"
          className="relative w-full max-w-5xl lg:max-w-6xl mx-auto px-1 sm:px-3 will-change-transform flex items-center justify-center"
          style={{
            transform: 'translate3d(0, 0px, 0)',
          }}
        >
          {/* Subtle magma ambient aura behind center characters */}
          <div
            className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full pointer-events-none opacity-45 -z-10 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(223, 80, 53, 0.35) 0%, rgba(184, 56, 34, 0.1) 50%, transparent 80%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={isEntered ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center overflow-visible"
            style={{ position: 'relative', height: '260px', width: '100%' }}
          >
            <TextPressure
              text="NITHISH"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#f4f4f5"
              strokeColor="#df5035"
              minFontSize={38}
            />
          </motion.div>
        </div>

        {/* ── 5. IMPROVED TAGLINE PLACEMENT (CLEANLY BELOW NITHISH AS IN MOCKUP) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex items-center justify-center text-center mt-2 sm:mt-3 px-4 select-none"
        >
          <span className="text-[#df5035] text-[10px] sm:text-xs md:text-sm font-mono font-semibold uppercase tracking-[0.22em] sm:tracking-[0.32em] md:tracking-[0.38em] text-balance">
            CRAFTING CODE &nbsp;•&nbsp; BUILDING INTELLIGENCE &nbsp;•&nbsp; CREATING EXPERIENCES
          </span>
        </motion.div>

        {/* ── 6. SOFTWARE DEVELOPER & SUBTITLE & TECH STRIP ── */}
        <div className="w-full flex flex-col items-center justify-center text-center mt-5 sm:mt-7 select-none">
          {/* TITLE: SOFTWARE DEVELOPER */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] md:tracking-[0.24em] text-white text-lg sm:text-2xl md:text-3xl lg:text-[2rem] leading-none"
          >
            SOFTWARE DEVELOPER
          </motion.h2>

          {/* SUBTITLE: Meaningful digital experiences */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm md:text-base text-zinc-400 font-sans mt-2.5 max-w-xl px-4 leading-relaxed text-balance font-normal"
          >
            I build scalable systems, intelligent solutions and meaningful digital experiences.
          </motion.p>

          {/* TECHNOLOGY LINE: JAVA | AI/ML | WEB | SYSTEMS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center flex-wrap gap-2 sm:gap-3.5 md:gap-5 mt-3 text-[11px] sm:text-xs md:text-sm font-mono tracking-[0.2em] sm:tracking-[0.26em] text-zinc-400 uppercase font-medium px-2"
          >
            <span>JAVA</span>
            <span className="text-zinc-600">|</span>
            <span>AI/ML</span>
            <span className="text-zinc-600">|</span>
            <span>WEB</span>
            <span className="text-zinc-600">|</span>
            <span>SYSTEMS</span>
          </motion.div>

          {/* ── 7. CONSOLIDATED CTAs (MATCHING PROPOSED REDESIGN) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.8, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-7"
          >
            {/* Primary: VIEW WORK (Glowing Crimson) */}
            <button
              type="button"
              onClick={onViewWork}
              className="clay-btn-accent inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider uppercase px-6 sm:px-8 py-3.5 sm:py-4 font-semibold cursor-pointer transition-all"
            >
              <span>VIEW WORK</span>
              <ArrowUpRight size={15} />
            </button>

            {/* Secondary: CONNECT (Dark Charcoal Glass) */}
            <button
              type="button"
              onClick={onConnect}
              className="clay-btn inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider uppercase px-6 sm:px-8 py-3.5 sm:py-4 font-semibold cursor-pointer transition-all border border-white/15"
            >
              <span>CONNECT</span>
              <ArrowUpRight size={15} className="text-zinc-400" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── 8. BOTTOM EDITORIAL ROW: COORDINATES (LEFT) & CIRCULAR SCROLL EXPLORER (RIGHT) ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-end justify-between px-2 sm:px-4 pt-4 select-none">
        {/* Bottom Left: Bangalore Technical Coordinates */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-0.5 font-mono text-[11px] sm:text-xs text-zinc-500 font-semibold"
        >
          <span className="text-zinc-600 text-xs mb-0.5">+</span>
          <span>12.9716° N</span>
          <span>77.5946° E</span>
        </motion.div>

        {/* Bottom Right: Circular Scroll Indicator (Matching Redesign Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 sm:gap-3.5"
        >
          <button
            type="button"
            onClick={onViewWork}
            className="group flex items-center gap-3 cursor-pointer p-1"
            aria-label="Scroll to explore"
          >
            {/* Glowing crimson-rimmed circle with arrow */}
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#df5035]/60 bg-[#0d0d11] flex items-center justify-center text-[#df5035] shadow-[0_0_18px_rgba(223,80,53,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(223,80,53,0.5)] transition-all"
            >
              <ArrowDown size={15} />
            </motion.div>

            {/* 2-line SCROLL TO EXPLORE label */}
            <div className="flex flex-col text-left font-mono text-[10px] sm:text-[11px] tracking-widest text-zinc-400 group-hover:text-white uppercase font-semibold leading-tight transition-colors">
              <span>SCROLL</span>
              <span>TO EXPLORE</span>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
