import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowDown } from 'lucide-react';
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
  // When scrolling down, the large NITHISH typography drifts vertically at a slightly slower rate (~26%)
  // than normal page content, creating gentle, refined cinematic depth without disturbing layout or mouse interaction
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

      // Constrained cinematic vertical parallax:
      // Typography begins drifting upward slightly slower than the page when scroll starts,
      // travels only a short, safe distance (max 24px), and then stops firmly at the boundary
      // without ever entering, crossing, or overlapping the SOFTWARE DEVELOPER area below.
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
      // If user has scrolled far past the Hero, stop parallax calculations
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

    // IntersectionObserver to pause parallax when Hero is outside viewport
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
      className="relative w-full h-screen min-h-[580px] sm:min-h-[640px] lg:min-h-[660px] flex flex-col justify-between pt-[68px] sm:pt-[76px] lg:pt-[80px] pb-3 sm:pb-5 lg:pb-6 px-3 sm:px-6 md:px-8 mx-auto overflow-hidden select-none"
    >
      {/* ── STATIC AMBIENT ATMOSPHERIC BACKGROUND (CREAM BASE WITH DIFFUSED TERRACOTTA BLUSH & SOFT VIGNETTE) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden"
        aria-hidden="true"
        style={{
          backgroundColor: '#f5f1eb',
          backgroundImage: `
            radial-gradient(ellipse 90% 70% at 50% 48%, rgba(255, 253, 250, 0.75) 0%, rgba(245, 241, 235, 0) 100%),
            radial-gradient(ellipse 75% 65% at 92% 8%, rgba(196, 84, 63, 0.038) 0%, rgba(245, 241, 235, 0) 72%),
            radial-gradient(ellipse 80% 60% at 8% 92%, rgba(223, 107, 85, 0.032) 0%, rgba(245, 241, 235, 0) 72%),
            radial-gradient(ellipse 110% 95% at 50% 50%, rgba(245, 241, 235, 0) 58%, rgba(234, 227, 217, 0.45) 100%)
          `,
        }}
      />

      {/* ── HERO GLOWCURSOR (OGL/WebGL, ACTIVE ONLY INSIDE HERO SECTION) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <GlowCursor
          boundRef={sectionRef}
          className="w-full h-full"
          color="#c4543f"
          secondaryColor="#c4543f"
          trailLength={35}
          trailWidth={7}
          trailTaper={0.85}
          followSpeed={0.18}
          glowIntensity={1.6}
          glowSpread={1.1}
          hotspot={0.35}
          brightness={1.15}
          opacity={0.85}
          pulseSpeed={0.7}
          noiseStrength={0.02}
          idleFade={true}
          idleTimeout={600}
          fadeDuration={600}
          blendMode="normal"
          maxDevicePixelRatio={1.5}
        />
      </div>

      {/* ── TOP & MIDDLE CONTAINER: TOP EDGE LOCKED, NITHISH GLYPHS COVER 100% OF FRAME HEIGHT ── */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-start items-center text-center overflow-visible pt-2 sm:pt-3">
        {/* Architectural Name: "NITHISH" powered by React Bits TextPressure Variable Font Animation */}
        <div
          ref={headingRef}
          aria-label="Nithish"
          className="relative w-full flex-1 flex items-center justify-center overflow-visible max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto px-1 sm:px-3 will-change-transform min-h-[160px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[340px] h-full"
          style={{
            transform: 'translate3d(0, 0px, 0)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center overflow-visible"
            style={{ position: 'relative', height: '300px', width: '100%' }}
          >
            <TextPressure
              text="NITHISH"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#171717"
              strokeColor="#c4543f"
              minFontSize={36}
            />
          </motion.div>

          {/* ── OVERLAY TEXT CENTERED OVER THE MIDDLE OF THE LARGE LETTERS (PLAIN FLOATING TEXT - ZERO PILL/CAPSULE/BORDER/BLUR) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isEntered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none z-10 px-2 sm:px-4"
          >
            <span
              className="text-[#c4543f] text-[7.5px] sm:text-[9.5px] md:text-[10.5px] lg:text-xs font-mono font-medium uppercase text-center select-none tracking-[0.12em] sm:tracking-[0.24em] md:tracking-[0.32em] lg:tracking-[0.40em] max-w-full text-balance px-2"
            >
              CRAFTING CODE • BUILDING INTELLIGENCE • CREATING EXPERIENCES
            </span>
          </motion.div>
        </div>

        {/* ── 2 LINES BELOW: SOFTWARE DEVELOPER (EXACTLY 35px GAP DIRECTLY FROM NITHISH S VISIBLE GLYPHS ON DESKTOP) ── */}
        <div
          className="w-full flex flex-col items-center justify-center text-center mt-auto relative z-20 mb-3 sm:mb-6 lg:mb-[40px]"
        >
          {/* TITLE: "SOFTWARE DEVELOPER" (Exactly 35px below the visible NITHISH S text on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.82, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="w-full text-center font-poster font-bold uppercase tracking-[0.14em] sm:tracking-[0.2em] md:tracking-[0.24em] text-[#1f1c19] text-sm sm:text-xl md:text-2xl lg:text-[1.85rem] leading-none select-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] mt-3 sm:mt-5 lg:mt-[35px]"
            style={{
              fontFamily: '"Antonio", "Bebas Neue", "League Gothic", sans-serif',
            }}
          >
            SOFTWARE DEVELOPER
          </motion.div>

          {/* TECHNOLOGY LINE: JAVA • AI/ML • WEB • SYSTEMS */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.82, delay: 0.86, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center flex-wrap gap-2 sm:gap-3.5 md:gap-5 mt-2.5 sm:mt-3 text-[10px] sm:text-sm md:text-base font-mono tracking-[0.16em] sm:tracking-[0.25em] md:tracking-[0.3em] text-[#5e5852] uppercase font-semibold select-none px-2"
          >
            <span>JAVA</span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#c4543f]" />
            <span>AI/ML</span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#c4543f]" />
            <span>WEB</span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#c4543f]" />
            <span>SYSTEMS</span>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS: LOCKED AT VERY BOTTOM OF VIEWPORT ── */}
      <div className="relative z-10 w-full flex flex-col gap-2.5 sm:gap-3 pb-1 px-1 sm:px-4 md:px-6 mt-auto">
        {/* ROW: VIEW WORK (LEFT) AND CONNECT (RIGHT) */}
        <div className="w-full flex items-center justify-between gap-3">
          {/* LOWER LEFT: VIEW WORK */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.82, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-start items-center"
          >
            <button
              type="button"
              onClick={onViewWork}
              className="clay-btn-accent inline-flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs md:text-sm font-mono tracking-widest uppercase px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 font-semibold cursor-pointer shadow-md min-h-[44px]"
            >
              <span>VIEW WORK</span>
              <ArrowDownRight size={14} className="sm:w-[15px] sm:h-[15px]" />
            </button>
          </motion.div>

          {/* LOWER RIGHT: CONNECT */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.82, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-end items-center"
          >
            <button
              type="button"
              onClick={onConnect}
              className="clay-btn inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 font-semibold cursor-pointer shadow-md min-h-[44px]"
            >
              <span>CONNECT</span>
            </button>
          </motion.div>
        </div>

        {/* BOTTOM CENTER: SCROLL TO EXPLORE + ARROW */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.82, delay: 1.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center justify-center text-center -mt-1 sm:-mt-2"
        >
          <button
            type="button"
            onClick={onViewWork}
            className="group flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer text-[#7a7269] hover:text-[#1f1c19] transition-colors p-1"
            aria-label="Scroll to explore"
          >
            <span className="text-[10px] sm:text-[11px] md:text-xs font-mono tracking-[0.18em] sm:tracking-[0.22em] uppercase font-semibold">
              SCROLL TO EXPLORE
            </span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="will-change-transform inline-flex p-1 sm:p-1.5 rounded-full clay-btn"
              style={{ transform: 'translateZ(0)' }}
            >
              <ArrowDown size={13} className="sm:w-[14px] sm:h-[14px] text-[#c4543f]" />
            </motion.div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
