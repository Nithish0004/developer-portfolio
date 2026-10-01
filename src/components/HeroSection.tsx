import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowDown } from 'lucide-react';
import GlowCursor from './GlowCursor';

interface HeroSectionProps {
  isEntered?: boolean;
  onViewWork: () => void;
  onConnect: () => void;
}

// Character definition including space for seamless typographic span
interface HeroChar {
  char: string;
  isSpace?: boolean;
  isLast?: boolean;
}

const HERO_CHARS: HeroChar[] = [
  { char: 'N' },
  { char: 'I' },
  { char: 'T' },
  { char: 'H' },
  { char: 'I' },
  { char: 'S' },
  { char: 'H' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  isEntered = true,
  onViewWork,
  onConnect,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const letterWrapperRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  // 60FPS CONTINUOUS ELASTIC DISTANCE-FIELD PHYSICS
  // Uses cursor distance to generate a continuous traveling width wave:
  // thin -> medium -> WIDE -> medium -> thin across NITHISH
  // Pointer movement updates target cursor; requestAnimationFrame smoothly LERPs the wave without snapping
  useEffect(() => {
    // Only enable on desktop pointer devices; keep clean static fallback on touch/mobile
    const isFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!isFinePointer) {
      const applyTouchFallback = () => {
        const isMobile = window.innerWidth < 768;
        const stableScaleX = isMobile ? 0.62 : 0.72;
        letterWrapperRefs.current.forEach((el) => {
          if (el) {
            el.style.transform = `translateX(0px) scaleX(${stableScaleX}) scaleY(1) translateZ(0)`;
            const innerSpan = el.firstElementChild as HTMLElement | null;
            if (innerSpan) {
              (innerSpan.style as any).webkitTextStroke = '0px transparent';
            }
          }
        });
      };

      applyTouchFallback();
      window.addEventListener('resize', applyTouchFallback, { passive: true });
      window.addEventListener('orientationchange', applyTouchFallback, { passive: true });
      return () => {
        window.removeEventListener('resize', applyTouchFallback);
        window.removeEventListener('orientationchange', applyTouchFallback);
      };
    }

    const heading = headingRef.current;
    if (!heading) return;

    let rafId: number | null = null;
    let targetMouseX = -9999;
    let currentMouseX = -9999;
    let isTracking = false;
    let trackingIntensity = 0.0; // Smooth 0.0 -> 1.0 tracking fade-in/fade-out
    let isHeroInView = true;

    // Cached heading rect to eliminate layout thrashing inside 60FPS animation loop
    let cachedHeadingRect = { left: 0, right: 0, top: 0, bottom: 0, width: 1 };
    const updateHeadingRect = () => {
      if (headingRef.current) {
        const r = headingRef.current.getBoundingClientRect();
        cachedHeadingRect = {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: Math.max(r.width, 1)
        };
      }
    };
    updateHeadingRect();

    const N_CHARS = HERO_CHARS.length; // 7 letters: N-I-T-H-I-S-H
    const N_NODES = N_CHARS + 1;       // 8 boundaries

    // Resting uniform coordinate for each node (0.0 at left border -> 1.0 at right border)
    const baseNodePositions = new Float32Array(N_NODES);
    for (let k = 0; k < N_NODES; k++) {
      baseNodePositions[k] = k / N_CHARS;
    }

    const BASE_SLOT_WIDTH = 1.0 / N_CHARS;

    // Node displacement state for smooth fluid elastic strip animation
    const currentNodePositions = new Float32Array(baseNodePositions);
    const targetNodePositions = new Float32Array(baseNodePositions);

    // Dynamic scaleX and stroke thickness for each character
    // RESTING STATE: Extremely tall, hairline-thin and narrow (scaleX = 0.16)
    const REST_SCALE_X = 0.16;
    const currentScalesX = new Float32Array(N_CHARS);
    const currentStrokes = new Float32Array(N_CHARS);
    const currentOffsetsX = new Float32Array(N_CHARS);

    currentScalesX.fill(REST_SCALE_X);
    currentStrokes.fill(0);
    currentOffsetsX.fill(0);

    const updateElasticField = () => {
      if (!isHeroInView || document.hidden) {
        rafId = null;
        return;
      }

      const wrappers = letterWrapperRefs.current;
      const headingEl = headingRef.current;
      if (!headingEl) return;

      const frameWidth = cachedHeadingRect.width;
      let isAnimating = false;

      // 1. Smoothly interpolate cursor position and tracking intensity
      const targetIntensity = isTracking ? 1.0 : 0.0;
      const diffIntensity = targetIntensity - trackingIntensity;
      if (Math.abs(diffIntensity) > 0.001) {
        isAnimating = true;
        // Fast yet smooth decay when leaving (0.16), smooth rise on entering (0.12)
        trackingIntensity += diffIntensity * (isTracking ? 0.12 : 0.16);
      } else {
        trackingIntensity = targetIntensity;
      }

      if (currentMouseX < -5000) {
        currentMouseX = targetMouseX;
      } else if (isTracking) {
        const diffMouse = targetMouseX - currentMouseX;
        if (Math.abs(diffMouse) > 0.1) {
          isAnimating = true;
          currentMouseX += diffMouse * 0.14; // Soft cursor follow LERP
        } else {
          currentMouseX = targetMouseX;
        }
      }

      // Normalized cursor position across the typography frame (0.0 = left edge, 1.0 = right edge)
      const normCursorX = (currentMouseX - cachedHeadingRect.left) / frameWidth;

      // 2. Continuous Elastic Node Boundary Calculation
      // Outer boundaries at endpoints (0 and N_NODES - 1) are strictly locked to frame edges (0.0 and 1.0)
      // Overall typography frame stays 100% fixed at all times
      targetNodePositions[0] = 0.0;
      targetNodePositions[N_NODES - 1] = 1.0;

      // Smooth traveling wave parameters
      // A broad continuous bell curve pushes nodes away from the cursor
      // creating a continuous: thin -> medium -> WIDE -> medium -> thin wave across the word
      const WAVE_RADIUS = 0.46; // ~46% of word width responds
      const MAX_PUSH = 0.105 * trackingIntensity;

      for (let k = 1; k < N_NODES - 1; k++) {
        const basePos = baseNodePositions[k];
        const distToCursor = basePos - normCursorX;

        if (trackingIntensity > 0.005 && Math.abs(distToCursor) < WAVE_RADIUS) {
          // Smooth sine curve for continuous outward push: pushes left nodes left, right nodes right
          const normalizedDist = distToCursor / WAVE_RADIUS; // -1.0 to +1.0
          const pushCurve = Math.sin(normalizedDist * Math.PI); // -1.0 to +1.0
          
          // Edge damping ensures boundaries taper smoothly to 0 at the frame ends
          const edgeDamping = Math.sin(basePos * Math.PI);
          targetNodePositions[k] = basePos + pushCurve * MAX_PUSH * edgeDamping;
        } else {
          targetNodePositions[k] = basePos;
        }
      }

      // Smoothly interpolate nodes toward target (soft elastic inertia, no bouncing/overshoot)
      for (let k = 1; k < N_NODES - 1; k++) {
        const diff = targetNodePositions[k] - currentNodePositions[k];
        if (Math.abs(diff) > 0.00015) {
          isAnimating = true;
          currentNodePositions[k] += diff * 0.18;
        } else {
          currentNodePositions[k] = targetNodePositions[k];
        }
      }

      // 3. Derive Continuous Distance-Based Scale and Physical Width Transfer for each Letter
      for (let i = 0; i < N_CHARS; i++) {
        const el = wrappers[i];
        if (!el) continue;

        const leftNode = currentNodePositions[i];
        const rightNode = currentNodePositions[i + 1];
        const cellCenter = (leftNode + rightNode) * 0.5;
        const baseCenter = (baseNodePositions[i] + baseNodePositions[i + 1]) * 0.5;

        // Continuous Distance to Current Interpolated Cursor
        const dist = Math.abs(cellCenter - normCursorX);
        const FIELD_WIDTH = 0.42;

        let distanceFactor = 0.0;
        if (trackingIntensity > 0.005 && dist < FIELD_WIDTH) {
          // Continuous cosine falloff: 1.0 directly under cursor, tapering smoothly through neighbors
          // Produces continuous: thin -> medium -> WIDE -> medium -> thin wave
          const normDist = dist / FIELD_WIDTH;
          distanceFactor = 0.5 * (1 + Math.cos(normDist * Math.PI)) * trackingIntensity;
        }

        // Controlled, balanced expansion:
        // Far away / Resting: extremely thin and narrow (0.16)
        // Medium neighbors: ~0.55 - 0.90
        // Under cursor center: ~1.45 (noticeably wide, strong black area, fully readable)
        // Minimum width clamp 0.14: ensures crisp, razor-sharp architectural presence
        const targetScaleX = Math.max(0.14, REST_SCALE_X + distanceFactor * 1.30);
        
        // Horizontal physical shift derived from connected elastic strip
        const targetShiftX = (cellCenter - baseCenter) * frameWidth;

        // Progressive, subtle black text stroke widening that travels with the wave
        const targetStroke = distanceFactor * 2.2;

        // Smooth continuous interpolation
        const diffSX = targetScaleX - currentScalesX[i];
        const diffStr = targetStroke - currentStrokes[i];
        const diffTX = targetShiftX - currentOffsetsX[i];

        if (
          Math.abs(diffSX) > 0.0008 ||
          Math.abs(diffStr) > 0.015 ||
          Math.abs(diffTX) > 0.08
        ) {
          isAnimating = true;
          currentScalesX[i] += diffSX * 0.18;
          currentStrokes[i] += diffStr * 0.18;
          currentOffsetsX[i] += diffTX * 0.18;
        } else {
          currentScalesX[i] = targetScaleX;
          currentStrokes[i] = targetStroke;
          currentOffsetsX[i] = targetShiftX;
        }

        const sx = currentScalesX[i];
        const str = currentStrokes[i];
        const tx = currentOffsetsX[i];

        // Apply deformation:
        // - Continuous horizontal scaleX wave
        // - Horizontal shift along connected ribbon
        // - ZERO vertical movement, ZERO rotation, ZERO whole-word scaling
        el.style.transform = `translateX(${tx.toFixed(2)}px) scaleX(${sx.toFixed(4)}) scaleY(1) translateZ(0)`;

        // Smoothly transfer black stroke thickness
        const innerSpan = el.firstElementChild as HTMLElement | null;
        if (innerSpan) {
          if (str > 0.04) {
            (innerSpan.style as any).webkitTextStroke = `${str.toFixed(2)}px #1f1c19`;
            (innerSpan.style as any).paintOrder = 'stroke fill';
          } else {
            (innerSpan.style as any).webkitTextStroke = '0px transparent';
          }
        }
      }

      if (isTracking || isAnimating || trackingIntensity > 0.001) {
        rafId = requestAnimationFrame(updateElasticField);
      } else {
        // Guarantee clean, exact resting state at end of animation
        for (let i = 0; i < N_CHARS; i++) {
          const el = wrappers[i];
          if (el) {
            el.style.transform = `translateX(0px) scaleX(${REST_SCALE_X}) scaleY(1) translateZ(0)`;
            const innerSpan = el.firstElementChild as HTMLElement | null;
            if (innerSpan) {
              (innerSpan.style as any).webkitTextStroke = '0px transparent';
            }
          }
        }
        rafId = null;
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      updateHeadingRect();
      targetMouseX = e.clientX;
      if (currentMouseX < -5000) {
        currentMouseX = e.clientX;
      }
      isTracking = true;
      if (!rafId && isHeroInView && !document.hidden) {
        rafId = requestAnimationFrame(updateElasticField);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isHeroInView || document.hidden) return;

      // Confirm pointer is strictly within bounding box of the heading using cached rect
      if (
        e.clientX < cachedHeadingRect.left ||
        e.clientX > cachedHeadingRect.right ||
        e.clientY < cachedHeadingRect.top ||
        e.clientY > cachedHeadingRect.bottom
      ) {
        if (isTracking) {
          isTracking = false;
          if (!rafId) {
            rafId = requestAnimationFrame(updateElasticField);
          }
        }
        return;
      }

      targetMouseX = e.clientX;
      isTracking = true;
      if (!rafId) {
        rafId = requestAnimationFrame(updateElasticField);
      }
    };

    const onPointerLeave = () => {
      isTracking = false;
      if (!rafId) {
        rafId = requestAnimationFrame(updateElasticField);
      }
    };

    // IntersectionObserver to pause NITHISH physics when Hero is out of viewport
    const ioPhysics = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? true;
        isHeroInView = inView;
        if (!inView) {
          isTracking = false;
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        } else {
          updateHeadingRect();
        }
      },
      { threshold: 0 }
    );
    if (sectionRef.current) ioPhysics.observe(sectionRef.current);

    const onVisibilityPhysics = () => {
      if (document.hidden) {
        isTracking = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (isHeroInView) {
        updateHeadingRect();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityPhysics);

    window.addEventListener('resize', updateHeadingRect, { passive: true });
    window.addEventListener('scroll', updateHeadingRect, { passive: true });

    heading.addEventListener('pointerenter', onPointerEnter);
    heading.addEventListener('pointermove', onPointerMove);
    heading.addEventListener('pointerleave', onPointerLeave);

    // Initial render: set all characters to resting narrow width
    const wrappers = letterWrapperRefs.current;
    for (let i = 0; i < wrappers.length; i++) {
      if (wrappers[i]) {
        wrappers[i]!.style.transform = `translateX(0px) scaleX(0.16) scaleY(1) translateZ(0)`;
      }
    }

    return () => {
      ioPhysics.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityPhysics);
      window.removeEventListener('resize', updateHeadingRect);
      window.removeEventListener('scroll', updateHeadingRect);
      heading.removeEventListener('pointerenter', onPointerEnter);
      heading.removeEventListener('pointermove', onPointerMove);
      heading.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
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
        {/* Architectural Name: "NITHISH" (Single fixed frame, internal connected elastic strip) */}
        <h1
          ref={headingRef}
          aria-label="Nithish"
          className="relative w-full flex-1 flex items-stretch justify-center flex-nowrap whitespace-nowrap uppercase text-center select-none text-[#1f1c19] drop-shadow-[0_4px_24px_rgba(184,169,153,0.25)] overflow-visible m-0 p-0 text-[11vw] md:text-[36vh] lg:text-[40vh] leading-[0.88] font-bold h-full max-h-full will-change-transform"
          style={{
            fontFamily: '"Antonio", "Bebas Neue", "League Gothic", sans-serif',
            letterSpacing: 'normal',
            transform: 'translate3d(0, 0px, 0)',
          }}
        >
          {/* FIXED OVERALL FRAME (Never zooms or moves) */}
          <div className="w-full flex items-stretch justify-center overflow-visible h-full max-w-4xl sm:max-w-5xl mx-auto px-1 sm:px-0">
            {HERO_CHARS.map((item, index) => {
              if (item.isSpace) {
                return (
                  <span
                    key={`space-${index}`}
                    ref={(el) => {
                      letterWrapperRefs.current[index] = el;
                    }}
                    className="inline-flex items-stretch justify-center h-full will-change-transform origin-center flex-1 max-w-[4vw] min-w-[14px]"
                    style={{
                      transform: 'translateX(0px) translateY(0px) scaleX(0.38) scaleY(1) translateZ(0)',
                    }}
                    aria-hidden="true"
                  />
                );
              }

              return (
                <span
                  key={`char-${index}-${item.char}`}
                  className="inline-flex items-stretch justify-center overflow-visible h-full flex-1"
                >
                  {/* CONNECTED ELASTIC CELL: deforms within the fixed frame */}
                  <span
                    ref={(el) => {
                      letterWrapperRefs.current[index] = el;
                    }}
                    className="inline-flex items-stretch justify-center h-full w-full will-change-transform origin-center"
                    style={{
                      transform: 'translateX(0px) scaleX(0.16) scaleY(1) translateZ(0)',
                    }}
                  >
                    <motion.span
                      initial={{ y: '125%', opacity: 0 }}
                      animate={isEntered ? { y: '0%', opacity: 1 } : { y: '125%', opacity: 0 }}
                      transition={{
                        duration: 0.85,
                        delay: index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`inline-flex items-center justify-center will-change-[transform,opacity] leading-none select-none origin-top h-full w-full ${
                        item.isLast ? 'text-[#8a8175]' : 'text-[#1f1c19]'
                      }`}
                      style={{ transform: 'translateZ(0) scaleY(5.8)' }}
                    >
                      {item.char}
                    </motion.span>
                  </span>
                </span>
              );
            })}
          </div>

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
        </h1>

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
