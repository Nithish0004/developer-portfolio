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
  { id: 1, delay: 0.85, isCenter: false }, // Section #1 (outer left)
  { id: 2, delay: 0.70, isCenter: false }, // Section #2
  { id: 3, delay: 0.55, isCenter: false }, // Section #3
  { id: 4, delay: 0.40, isCenter: true },  // Section #4 (CENTER - opens first, slightly wider)
  { id: 5, delay: 0.55, isCenter: false }, // Section #5
  { id: 6, delay: 0.70, isCenter: false }, // Section #6
  { id: 7, delay: 0.85, isCenter: false }, // Section #7 (outer right)
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden bg-transparent ${
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
                  duration: 0.72,
                  delay: section.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full h-[50.5%] will-change-transform bg-[#08080a]"
                style={{
                  background: 'radial-gradient(ellipse 120% 100% at 50% 100%, #1b1922 0%, #111013 55%, #08080a 100%)',
                  transform: 'translateZ(0)',
                }}
              />

              {/* BOTTOM HALF - moves DOWNWARD from middle equator */}
              <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '101%' }}
                transition={{
                  duration: 0.72,
                  delay: section.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full h-[50.5%] will-change-transform bg-[#08080a]"
                style={{
                  background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #1b1922 0%, #111013 55%, #08080a 100%)',
                  transform: 'translateZ(0)',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* During loading: 100% solid, pristine, completely seamless blackish surface */
        <div
          className="absolute inset-0 z-10 w-full h-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #1d1b22 0%, #111013 65%, #08080a 100%)',
            backgroundColor: '#08080a',
          }}
        />
      )}

      {/* ── 2. LOADING CONTENT (N LOGO + UPLINKLOADER) - MOVES UPWARD ON EXIT ── */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{
          y: isExiting ? '-125%' : '0%',
        }}
        transition={{
          duration: 0.68,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl mx-auto my-auto p-6 sm:p-10 will-change-transform"
      >
        {/* 1. Animated "N" Logo with ThreeUI Lightning in Tactile Clay Medallion */}
        <div className="relative flex items-center justify-center">
          {/* Ambient soft glow around clay medallion */}
          <div className="absolute -inset-10 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />

          {/* Tactile Raised Clay Frame for N Logo */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[38px] sm:rounded-[46px] md:rounded-[52px] bg-gradient-to-b from-[#242228] to-[#121114] p-3 sm:p-4 border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),inset_0_2px_3px_rgba(255,255,255,0.22),inset_0_-3px_6px_rgba(0,0,0,0.6)] flex items-center justify-center"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Inner Recessed Clay Well for the ThreeUI Lightning Canvas */}
            <div className="w-full h-full rounded-[30px] sm:rounded-[38px] md:rounded-[44px] overflow-hidden bg-[#060708] shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] relative">
              <ElementsCollection
                variant="lightning"
                mark="n"
                speed={1.0}
                size={1.12}
                particleAmount={1.2}
                saturation={0}
                brightness={1.15}
                opacity={1.0}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* 2. Prominent Tactile Clay UplinkLoader Container */}
        <div className="w-full max-w-[620px] sm:max-w-[760px] md:max-w-[860px] mt-8 sm:mt-10 md:mt-12 flex flex-col items-center">
          <div className="relative w-full h-16 sm:h-20 rounded-3xl bg-gradient-to-b from-[#1e1c22] to-[#121114] p-2 sm:p-2.5 border border-white/10 shadow-[0_18px_38px_-8px_rgba(0,0,0,0.7),inset_0_1.5px_2px_rgba(255,255,255,0.18),inset_0_-2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
            {/* The original ThreeUI UplinkLoader */}
            <UplinkLoader
              className="w-full h-full"
              onComplete={handleUplinkComplete}
            />
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
