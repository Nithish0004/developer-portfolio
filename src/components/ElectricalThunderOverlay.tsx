import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ElectricalThunderOverlayProps {
  active: boolean;
  onComplete?: () => void;
}

/**
 * Cinematic Atmospheric Electrical Thunder Event
 * Triggered at ~50–60% Uplink progress.
 * Sequence:
 * 1. Ionization at top-left origin (0%, 0%)
 * 2. Delicate branching electrical lightning expands across the ENTIRE viewport
 * 3. Brief cinematic electrical flash illuminates the entire screen
 * 4. Soft decaying ambient afterglow fades smoothly back to neutral dark clay
 */
export const ElectricalThunderOverlay: React.FC<ElectricalThunderOverlayProps> = ({
  active,
  onComplete,
}) => {
  // Stages: 0: idle, 1: top-left spark, 2: viewport expansion, 3: peak illumination, 4: decaying glow, 5: complete
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    if (!active || stage !== 0) return;

    // Stage 1: Spark emerges at top-left (0ms)
    setStage(1);

    // Stage 2: Electrical branches spread across entire viewport (80ms)
    const t2 = setTimeout(() => {
      setStage(2);
    }, 80);

    // Stage 3: Peak whole-screen electrical flash (180ms)
    const t3 = setTimeout(() => {
      setStage(3);
    }, 180);

    // Stage 4: Soft decaying afterglow (340ms)
    const t4 = setTimeout(() => {
      setStage(4);
    }, 340);

    // Stage 5: Final fadeout and cleanup (680ms)
    const t5 = setTimeout(() => {
      setStage(0);
      onComplete?.();
    }, 680);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [active, onComplete]);

  if (stage === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[10050] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Cinematic Radial Light Wave Originating from Top-Left (0, 0) */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity:
            stage === 1
              ? 0.4
              : stage === 2
              ? 0.75
              : stage === 3
              ? 0.85
              : stage === 4
              ? 0.3
              : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{
          background:
            stage <= 2
              ? 'radial-gradient(circle 80vw at 0% 0%, rgba(255, 255, 255, 0.45) 0%, rgba(240, 245, 255, 0.2) 40%, transparent 75%)'
              : 'radial-gradient(circle 160vw at 5% 5%, rgba(255, 255, 255, 0.6) 0%, rgba(245, 248, 255, 0.35) 35%, rgba(255, 255, 255, 0.1) 70%, transparent 100%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 2. Full-Viewport Branching Lightning System (Origin: Top-Left 0,0) */}
      {(stage === 2 || stage === 3 || stage === 4) && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="thunderGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#f0f5ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#dce8f8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Main Diagonal Spine across entire viewport */}
          <motion.path
            d="M 0,0 L 75,50 L 130,115 L 215,155 L 290,230 L 390,265 L 485,350 L 590,395 L 710,490 L 830,545 L 970,640 L 1110,710 L 1260,795 L 1380,855 L 1440,900"
            stroke="url(#boltGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#thunderGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: stage === 3 ? 1 : 0.65 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          />
          {/* Main Hot White Core Filament */}
          <motion.path
            d="M 0,0 L 75,50 L 130,115 L 215,155 L 290,230 L 390,265 L 485,350 L 590,395 L 710,490 L 830,545 L 970,640 L 1110,710 L 1260,795 L 1380,855 L 1440,900"
            stroke="#ffffff"
            strokeWidth="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          {/* Primary Branch 1: Upper Viewport Traverse */}
          <motion.path
            d="M 290,230 L 380,185 L 510,195 L 660,145 L 820,165 L 990,125 L 1170,145 L 1330,115 L 1440,135"
            stroke="url(#boltGrad)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#thunderGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: stage === 3 ? 0.9 : 0.5 }}
            transition={{ duration: 0.12, delay: 0.02 }}
          />
          <motion.path
            d="M 290,230 L 380,185 L 510,195 L 660,145 L 820,165 L 990,125 L 1170,145 L 1330,115 L 1440,135"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.1, delay: 0.02 }}
          />

          {/* Primary Branch 2: Center Downward Strike */}
          <motion.path
            d="M 485,350 L 525,450 L 575,550 L 635,660 L 690,780 L 730,900"
            stroke="url(#boltGrad)"
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.1, delay: 0.03 }}
          />
          <motion.path
            d="M 485,350 L 525,450 L 575,550 L 635,660 L 690,780 L 730,900"
            stroke="#ffffff"
            strokeWidth="0.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.09, delay: 0.03 }}
          />

          {/* Primary Branch 3: Mid-Right Horizontal Arc */}
          <motion.path
            d="M 710,490 L 830,460 L 960,480 L 1110,445 L 1260,470 L 1440,450"
            stroke="url(#boltGrad)"
            strokeWidth="1.3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: 0.11, delay: 0.04 }}
          />

          {/* Primary Branch 4: Left-Side Ground Fork */}
          <motion.path
            d="M 130,115 L 155,220 L 125,330 L 165,460 L 135,590 L 180,730 L 150,900"
            stroke="url(#boltGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.1, delay: 0.02 }}
          />

          {/* Delicate Micro-Arcs across bottom right */}
          <motion.path
            d="M 970,640 L 1050,600 L 1160,620 L 1280,590 T 1440,610"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.08, delay: 0.05 }}
          />
          <motion.path
            d="M 1110,710 L 1160,780 L 1240,840 L 1280,900"
            stroke="#ffffff"
            strokeWidth="0.55"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 0.08, delay: 0.06 }}
          />
        </svg>
      )}

      {/* 3. Smooth Cinematic Whole-Screen Electrical Flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{
          opacity:
            stage === 2
              ? 0.1
              : stage === 3
              ? 0.28
              : stage === 4
              ? 0.08
              : 0,
        }}
        transition={{ duration: 0.08, ease: 'easeOut' }}
        style={{ mixBlendMode: 'screen' }}
      />

      {/* 4. Soft Edge Bloom Around Entire Viewport */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: stage === 3 ? 0.6 : stage === 4 ? 0.2 : 0,
        }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        style={{
          boxShadow: 'inset 0 0 90px 20px rgba(255, 255, 255, 0.25)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};
