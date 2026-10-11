import React, { useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { UplinkLoader, ElementsCollection } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

interface LoadingScreenProps {
  isExiting: boolean;
  onUplinkComplete: () => void;
}

// 7 vertical columns: center is #4 (index 3, slightly wider), opens first from center point
const SPLIT_SECTIONS = [
  { id: 1, delay: 0.82, isCenter: false }, // Section #1 (outer left)
  { id: 2, delay: 0.68, isCenter: false }, // Section #2
  { id: 3, delay: 0.52, isCenter: false }, // Section #3
  { id: 4, delay: 0.38, isCenter: true },  // Section #4 (CENTER - opens first, slightly wider)
  { id: 5, delay: 0.52, isCenter: false }, // Section #5
  { id: 6, delay: 0.68, isCenter: false }, // Section #6
  { id: 7, delay: 0.82, isCenter: false }, // Section #7 (outer right)
];

// Occasional tiny sparks around the logo
const SPARKS = [
  { id: 1, top: '14%', left: '22%', delay: '0.4s', duration: '3.2s', size: 3 },
  { id: 2, top: '28%', right: '16%', delay: '1.2s', duration: '2.8s', size: 2.5 },
  { id: 3, bottom: '22%', left: '18%', delay: '1.8s', duration: '3.6s', size: 3 },
  { id: 4, bottom: '18%', right: '24%', delay: '0.9s', duration: '3.0s', size: 2 },
  { id: 5, top: '50%', left: '8%', delay: '2.4s', duration: '4.0s', size: 2.5 },
  { id: 6, top: '44%', right: '9%', delay: '1.5s', duration: '3.4s', size: 2.5 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isExiting, onUplinkComplete }) => {
  const completedRef = useRef(false);

  const handleUplinkComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onUplinkComplete();
  }, [onUplinkComplete]);

  useEffect(() => {
    // Window message listener as primary/redundant receiver for iframe messages
    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data?.type === 'uplink-complete') {
        handleUplinkComplete();
      }
    };
    window.addEventListener('message', handleWindowMessage, { passive: true });

    // Fallback safety timeout: ensure completion even if iframe message is delayed
    const safetyTimer = setTimeout(() => {
      if (!completedRef.current) {
        handleUplinkComplete();
      }
    }, 6800);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [handleUplinkComplete]);

  return (
    <aside
      aria-hidden={isExiting ? 'true' : 'false'}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden bg-[#080808] ${
        isExiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* ── 1. BACKGROUND: SOLID SEAMLESS DURING LOADING, 7-SECTION CENTER SPLIT WHEN EXITING ── */}
      {isExiting ? (
        <div
          className="absolute inset-0 z-10 w-full h-full flex flex-row items-stretch p-0 m-0 pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
          style={{ transform: 'translateZ(0)' }}
        >
          {SPLIT_SECTIONS.map((section) => (
            <div
              key={section.id}
              className={`relative h-full flex flex-col ${
                section.isCenter ? 'flex-[1.4]' : 'flex-1'
              } -mr-[1px] last:mr-0`}
            >
              {/* TOP HALF - moves UPWARD from middle equator */}
              <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '-101%' }}
                transition={{
                  duration: 0.76,
                  delay: section.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full h-[50.5%] will-change-transform bg-[#080808]"
                style={{
                  background: 'radial-gradient(ellipse 120% 100% at 50% 100%, #151418 0%, #0d0d10 55%, #080808 100%)',
                  transform: 'translateZ(0)',
                }}
              />

              {/* BOTTOM HALF - moves DOWNWARD from middle equator */}
              <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '101%' }}
                transition={{
                  duration: 0.76,
                  delay: section.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full h-[50.5%] will-change-transform bg-[#080808]"
                style={{
                  background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #151418 0%, #0d0d10 55%, #080808 100%)',
                  transform: 'translateZ(0)',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* During loading: 100% solid, pristine, completely seamless black surface with subtle warm orange vignette */
        <div
          className="absolute inset-0 z-10 w-full h-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #141214 0%, #0c0a0c 60%, #080808 100%)',
            backgroundColor: '#080808',
          }}
        />
      )}

      {/* ── 2. LOADING CONTENT (N LOGO + UPLINKLOADER) WITH CINEMATIC ZOOM & SEAMLESS REVEAL ── */}
      <motion.div
        initial={{ opacity: 1, scale: 1, y: 0 }}
        animate={
          isExiting
            ? {
                opacity: [1, 1, 0],
                scale: [1, 1.15, 1.35],
                y: '-20%',
              }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{
          duration: 0.95,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.45, 1],
        }}
        className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl mx-auto my-auto p-6 sm:p-10 will-change-transform pointer-events-auto"
      >
        {/* 1. Animated "N" Logo with ThreeUI Lightning + Ambient Orange Concentric Rings & Sparks */}
        <div className="relative flex items-center justify-center">
          {/* Ambient soft warm orange glow aura */}
          <div
            className="absolute -inset-16 rounded-full pointer-events-none blur-3xl opacity-40 transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(229,101,72,0.45) 0%, rgba(255,112,79,0.18) 45%, transparent 75%)',
            }}
          />

          {/* Minimalist Thin Concentric Circular Animation Behind N Logo (CSS/SVG) */}
          <div
            className="absolute -inset-16 sm:-inset-24 md:-inset-28 pointer-events-none flex items-center justify-center select-none"
            aria-hidden="true"
          >
            {/* Outer Slow Clockwise Ring */}
            <svg
              className="absolute w-full h-full animate-[spin_48s_linear_infinite] opacity-35"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="250"
                cy="250"
                r="228"
                stroke="#E56548"
                strokeWidth="1"
                strokeDasharray="4 14"
                opacity="0.45"
              />
              <circle
                cx="250"
                cy="250"
                r="192"
                stroke="#FF704F"
                strokeWidth="1"
                strokeDasharray="18 36"
                opacity="0.35"
              />
              {/* Glowing point along the circular path */}
              <circle cx="442" cy="250" r="2.5" fill="#FFF4E9" filter="drop-shadow(0 0 6px #FF704F)" />
              <circle cx="250" cy="58" r="2" fill="#E56548" opacity="0.8" />
            </svg>

            {/* Inner Counter-Clockwise Ring */}
            <svg
              className="absolute w-[82%] h-[82%] animate-[spin_32s_linear_infinite_reverse] opacity-40"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="200"
                cy="200"
                r="164"
                stroke="#E56548"
                strokeWidth="1"
                strokeDasharray="1 8"
                opacity="0.5"
              />
              <circle
                cx="200"
                cy="200"
                r="140"
                stroke="#FF704F"
                strokeWidth="0.75"
                opacity="0.25"
              />
              {/* Glowing orbital sparks */}
              <circle cx="200" cy="36" r="2.2" fill="#FFF4E9" filter="drop-shadow(0 0 5px #FF704F)" />
              <circle cx="364" cy="200" r="1.8" fill="#FF704F" opacity="0.85" />
            </svg>

            {/* Subtle Orange Micro-Sparks around N container */}
            {SPARKS.map((s) => (
              <span
                key={s.id}
                className="absolute rounded-full bg-[#FFF4E9] pointer-events-none animate-pulse"
                style={{
                  top: s.top,
                  left: s.left,
                  right: s.right,
                  bottom: s.bottom,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  boxShadow: '0 0 8px #FF704F, 0 0 14px rgba(229,101,72,0.8)',
                  animationDelay: s.delay,
                  animationDuration: s.duration,
                }}
              />
            ))}
          </div>

          {/* Tactile Raised Clay Frame for N Logo with Restrained Orange Illumination */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[38px] sm:rounded-[46px] md:rounded-[52px] bg-[#111111] p-3 sm:p-4 border border-[#E56548]/35 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.95),0_0_24px_rgba(229,101,72,0.18),inset_0_2px_3px_rgba(255,244,233,0.18),inset_0_-3px_6px_rgba(0,0,0,0.7)] flex items-center justify-center transition-shadow duration-500"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Inner Recessed Clay Well for the ThreeUI Lightning Canvas */}
            <div className="w-full h-full rounded-[30px] sm:rounded-[38px] md:rounded-[44px] overflow-hidden bg-[#060708] shadow-[inset_0_4px_14px_rgba(0,0,0,0.9)] relative">
              <ElementsCollection
                variant="lightning"
                mark="n"
                speed={1.0}
                size={1.12}
                particleAmount={1.25}
                saturation={1.1}
                brightness={1.18}
                opacity={1.0}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* 2. UplinkLoader Container with Refined Orange Border Illumination */}
        <motion.div
          animate={isExiting ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[620px] sm:max-w-[760px] md:max-w-[860px] mt-8 sm:mt-10 md:mt-12 flex flex-col items-center"
        >
          <div className="relative w-full h-16 sm:h-20 rounded-3xl bg-gradient-to-b from-[#161519] to-[#0e0d10] p-2 sm:p-2.5 border border-[#E56548]/25 shadow-[0_18px_38px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(229,101,72,0.12),inset_0_1.5px_2px_rgba(255,244,233,0.14),inset_0_-2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center">
            {/* The ThreeUI UplinkLoader */}
            <UplinkLoader
              className="w-full h-full"
              onComplete={handleUplinkComplete}
            />
          </div>
        </motion.div>
      </motion.div>
    </aside>
  );
};

