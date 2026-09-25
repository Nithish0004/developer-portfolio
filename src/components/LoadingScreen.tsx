import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { UplinkLoader, ElementsCollection } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { ElectricalThunderOverlay } from './ElectricalThunderOverlay';
import { cinematicAudio } from '../utils/cinematicAudio';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDissolving, setIsDissolving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isThunderActive, setIsThunderActive] = useState(false);

  const completedRef = useRef(false);
  const thunderTriggeredRef = useRef(false);

  /**
   * Monitor UplinkLoader progress numerically (0% → 100%).
   * Trigger atmospheric electrical thunder around 50–60% progress.
   */
  const handleProgressUpdate = useCallback((pct: number, _phase?: string) => {
    const rounded = Math.min(100, Math.max(0, Math.round(pct)));
    setProgress((prev) => (rounded > prev ? rounded : prev));

    // Trigger electric thunder around 50–60% progress
    if (rounded >= 52 && !thunderTriggeredRef.current) {
      thunderTriggeredRef.current = true;
      setIsThunderActive(true);
      cinematicAudio.playAtmosphericThunder();
    }
  }, []);

  /**
   * UplinkLoader reaches REAL 100% and completes:
   * Automatically transition directly to the main portfolio with smooth cinematic dissolve.
   * No click, no button, no intermediate screen.
   */
  const handleUplinkComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    setProgress(100);
    cinematicAudio.playLogoResolved();

    // Brief settling beat for the 100% complete state, then direct automatic dissolve
    setTimeout(() => {
      setIsDissolving(true);
      cinematicAudio.playFinalResolve();

      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        onLoadingComplete();
      }, 720);
    }, 450);
  }, [onLoadingComplete]);

  useEffect(() => {
    // Prevent scrolling while loader is active
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Unlock Web Audio on first user gesture
    const handleUserGesture = () => {
      cinematicAudio.resume();
    };
    window.addEventListener('click', handleUserGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleUserGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleUserGesture, { once: true, passive: true });

    // Window message listener as primary/redundant receiver for iframe messages
    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data?.type === 'uplink-progress') {
        handleProgressUpdate(e.data.progress, e.data.phase);
      } else if (e.data?.type === 'uplink-complete') {
        handleUplinkComplete();
      }
    };
    window.addEventListener('message', handleWindowMessage);

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('message', handleWindowMessage);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [handleProgressUpdate, handleUplinkComplete]);

  if (!isVisible) return null;

  return (
    <motion.aside
      key="claymorphic-loading-screen"
      initial={{ opacity: 1 }}
      animate={{
        opacity: isDissolving ? 0 : 1,
        scale: isDissolving ? 1.05 : 1,
        filter: isDissolving ? 'blur(12px)' : 'none',
      }}
      transition={{
        duration: 0.72,
        ease: [0.77, 0, 0.175, 1],
      }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6 sm:p-10 select-none overflow-hidden bg-[#0f0e11]"
      style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #1d1b22 0%, #111013 65%, #08080a 100%)',
      }}
    >
      {/* ── ATMOSPHERIC ELECTRICAL THUNDER (Triggered at 50–60%, across entire viewport) ── */}
      <ElectricalThunderOverlay
        active={isThunderActive}
        onComplete={() => setIsThunderActive(false)}
      />

      {/* ── UNIFIED FULL-SCREEN CLAYMORPHIC COMPOSITION ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl mx-auto my-auto">
        {/* 1. Animated "N" Logo with ThreeUI Lightning in Tactile Clay Medallion */}
        <div className="relative flex items-center justify-center">
          {/* Ambient soft glow around clay medallion */}
          <div className="absolute -inset-10 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />

          {/* Tactile Raised Clay Frame for N Logo */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[38px] sm:rounded-[46px] md:rounded-[52px] bg-gradient-to-b from-[#242228] to-[#121114] p-3 sm:p-4 border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),inset_0_2px_3px_rgba(255,255,255,0.22),inset_0_-3px_6px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-500"
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
            {/* The existing ThreeUI UplinkLoader */}
            <UplinkLoader
              className="w-full h-full"
              onProgress={handleProgressUpdate}
              onComplete={handleUplinkComplete}
            />
          </div>

          {/* Clean Synchronized 0% → 100% Numerical Indicator */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16151a] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.65),0_1px_2px_rgba(255,255,255,0.08)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/75" />
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white/90 tabular-nums">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
