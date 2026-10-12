import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { ElementsCollection } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

interface LoadingScreenProps {
  isExiting: boolean;
  onUplinkComplete: () => void;
}

// 7 vertical columns for background exit curtain: center is #4, opens first from center point
const SPLIT_SECTIONS = [
  { id: 1, delay: 0.85, isCenter: false }, // Section #1 (outer left)
  { id: 2, delay: 0.70, isCenter: false }, // Section #2
  { id: 3, delay: 0.55, isCenter: false }, // Section #3
  { id: 4, delay: 0.40, isCenter: true },  // Section #4 (CENTER - opens first, slightly wider)
  { id: 5, delay: 0.55, isCenter: false }, // Section #5
  { id: 6, delay: 0.70, isCenter: false }, // Section #6
  { id: 7, delay: 0.85, isCenter: false }, // Section #7 (outer right)
];

// Realistic Uplink Keyframe Timeline (~6 seconds total progression)
const KEYFRAMES: [number, number][] = [
  [0, 0],
  [0.045, 9],
  [0.115, 9.6],
  [0.16, 22],
  [0.205, 23],
  [0.30, 38],
  [0.345, 39.5],
  [0.40, 53],
  [0.475, 54],
  [0.545, 68],
  [0.60, 69],
  [0.665, 81],
  [0.735, 82],
  [0.80, 92],
  [0.855, 93],
  [0.925, 99],
  [0.985, 99.4],
  [1.0, 100],
];
const RUN_DURATION = 6000;

function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 2.1);
}

function getProgressAt(u: number) {
  if (u >= 1) return 100;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const [t0, v0] = KEYFRAMES[i];
    const [t1, v1] = KEYFRAMES[i + 1];
    if (u <= t1) {
      return v0 + (v1 - v0) * easeOut((u - t0) / (t1 - t0));
    }
  }
  return 100;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isExiting, onUplinkComplete }) => {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  const handleUplinkComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onUplinkComplete();
  }, [onUplinkComplete]);

  // High-precision requestAnimationFrame progress loop
  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      if (completedRef.current) return;

      const elapsed = now - startTime;
      const normalizedTime = Math.min(1, elapsed / RUN_DURATION);
      const currentPct = getProgressAt(normalizedTime);

      setProgress(currentPct);

      if (normalizedTime >= 1 && !completedRef.current) {
        // Hold momentarily at 100% for visual satisfaction before signaling completion
        setTimeout(() => {
          handleUplinkComplete();
        }, 400);
        return;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Redundant window message listener for external/iframe messages
    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data?.type === 'uplink-complete') {
        handleUplinkComplete();
      }
    };
    window.addEventListener('message', handleWindowMessage, { passive: true });

    // Safety fallback timer to prevent infinite hang in any edge case
    const safetyTimer = setTimeout(() => {
      if (!completedRef.current) {
        handleUplinkComplete();
      }
    }, 6800);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(safetyTimer);
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [handleUplinkComplete]);

  // Static floating ember particles data for immersive cosmic depth
  const embers = useMemo(() => [
    { id: 1, left: '12%', top: '22%', size: 3, delay: '0s', duration: '7s', opacity: 0.65 },
    { id: 2, left: '18%', top: '65%', size: 4, delay: '1.2s', duration: '8.5s', opacity: 0.5 },
    { id: 3, left: '26%', top: '38%', size: 2.5, delay: '2.5s', duration: '6.2s', opacity: 0.7 },
    { id: 4, left: '33%', top: '80%', size: 3.5, delay: '0.8s', duration: '7.8s', opacity: 0.45 },
    { id: 5, left: '42%', top: '15%', size: 2, delay: '3.1s', duration: '9s', opacity: 0.6 },
    { id: 6, left: '58%', top: '18%', size: 3, delay: '1.7s', duration: '6.5s', opacity: 0.75 },
    { id: 7, left: '68%', top: '75%', size: 4, delay: '2.2s', duration: '8s', opacity: 0.55 },
    { id: 8, left: '74%', top: '32%', size: 2.5, delay: '0.4s', duration: '7.2s', opacity: 0.65 },
    { id: 9, left: '82%', top: '58%', size: 3, delay: '2.9s', duration: '6.8s', opacity: 0.5 },
    { id: 10, left: '88%', top: '24%', size: 2, delay: '1.5s', duration: '8.2s', opacity: 0.7 },
    { id: 11, left: '22%', top: '12%', size: 3, delay: '3.4s', duration: '7.5s', opacity: 0.6 },
    { id: 12, left: '78%', top: '82%', size: 3.5, delay: '0.9s', duration: '8.8s', opacity: 0.45 },
  ], []);

  const roundedPct = Math.round(progress);

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
                  background: 'radial-gradient(ellipse 120% 100% at 50% 100%, #1a1820 0%, #100f13 55%, #070709 100%)',
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
                  background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #1a1820 0%, #100f13 55%, #070709 100%)',
                  transform: 'translateZ(0)',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* During loading: Deep dark cinematic cosmos with glowing planetary horizon & ambient embers */
        <div
          className="absolute inset-0 z-10 w-full h-full pointer-events-none overflow-hidden"
          style={{
            backgroundColor: '#060608',
            backgroundImage: `
              radial-gradient(ellipse 100% 80% at 50% 45%, #18151e 0%, #0d0c11 50%, #060608 100%)
            `,
          }}
        >
          {/* Subtle floating ambient embers / firefly sparks drifting across the space */}
          {embers.map((ember) => (
            <motion.div
              key={ember.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ember.left,
                top: ember.top,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                backgroundColor: '#ff704f',
                boxShadow: '0 0 8px #ff5722, 0 0 16px rgba(255, 87, 34, 0.6)',
                opacity: ember.opacity,
              }}
              animate={{
                y: [-12, 12, -12],
                x: [-6, 6, -6],
                opacity: [ember.opacity * 0.4, ember.opacity, ember.opacity * 0.4],
                scale: [0.85, 1.25, 0.85],
              }}
              transition={{
                duration: parseFloat(ember.duration),
                delay: parseFloat(ember.delay),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Glowing Planetary Horizon Arc across bottom width */}
          <div className="absolute -bottom-24 sm:-bottom-32 left-1/2 -translate-x-1/2 w-[160vw] max-w-[2200px] h-[340px] pointer-events-none">
            {/* Volumetric red-orange atmospheric haze */}
            <div
              className="absolute inset-0 rounded-[100%] blur-[70px] opacity-45"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 87, 34, 0.75) 0%, rgba(220, 50, 20, 0.35) 45%, transparent 75%)',
              }}
            />
            {/* Crisp curved atmospheric limb */}
            <div
              className="absolute inset-0 rounded-[100%]"
              style={{
                borderTop: '2px solid rgba(255, 112, 79, 0.85)',
                boxShadow: '0 -4px 30px rgba(255, 87, 34, 0.5), inset 0 2px 20px rgba(255, 87, 34, 0.25)',
                background: 'linear-gradient(180deg, #09080c 0%, #050507 100%)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── 2. LOADING CONTENT (HUD RETICLE + ENHANCED N LOGO + DYNAMIC BAR + PHILOSOPHY) ── */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{
          y: isExiting ? '-125%' : '0%',
        }}
        transition={{
          duration: 0.68,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl mx-auto my-auto px-4 sm:px-8 py-6 will-change-transform"
      >
        {/* ── Center Stage: N Medallion with Precision HUD Reticle Behind It ── */}
        <div className="relative flex items-center justify-center">
          {/* Intense Warm Orange-Red Radial Back-Glow */}
          <div
            className="absolute w-[460px] h-[460px] sm:w-[560px] sm:h-[560px] rounded-full pointer-events-none -z-10 blur-[65px] opacity-80"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 95, 45, 0.55) 0%, rgba(229, 70, 35, 0.28) 40%, rgba(180, 40, 15, 0.08) 65%, transparent 78%)',
            }}
          />

          {/* Micro Details: Orbiting HUD Reticle Rings with Diamonds and Nodes */}
          <div
            className="absolute w-[480px] h-[480px] sm:w-[580px] sm:h-[580px] pointer-events-none -z-10 flex items-center justify-center"
            aria-hidden="true"
          >
            {/* Slow Smoothly Orbiting Reticle */}
            <motion.div
              className="w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 580 580"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Orbital Ring */}
                <circle
                  cx="290"
                  cy="290"
                  r="230"
                  stroke="rgba(229, 101, 72, 0.32)"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
                <circle
                  cx="290"
                  cy="290"
                  r="230"
                  stroke="rgba(255, 112, 79, 0.18)"
                  strokeWidth="0.75"
                />

                {/* Inner Orbital Ring */}
                <circle
                  cx="290"
                  cy="290"
                  r="170"
                  stroke="rgba(229, 101, 72, 0.22)"
                  strokeWidth="0.75"
                />

                {/* Geometric Accents on Orbit: Diamond / Rhombus at Cardinal/Diagonal positions */}
                {/* Right Orange Diamond Accent */}
                <polygon
                  points="520,290 525,285 530,290 525,295"
                  fill="#ff704f"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="0.5"
                  filter="drop-shadow(0 0 6px #ff5722)"
                />
                {/* Bottom-Right Diamond Accent */}
                <polygon
                  points="450,450 455,445 460,450 455,455"
                  fill="#ff704f"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="0.5"
                  filter="drop-shadow(0 0 6px #ff5722)"
                />
                {/* Top-Left Diamond Accent */}
                <polygon
                  points="130,130 135,125 140,130 135,135"
                  fill="#ff704f"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="0.5"
                  filter="drop-shadow(0 0 6px #ff5722)"
                />

                {/* Circular Nodes */}
                <circle cx="290" cy="60" r="3.5" fill="#ff704f" filter="drop-shadow(0 0 5px #ff704f)" />
                <circle cx="290" cy="520" r="2.5" fill="#ff704f" opacity="0.8" />
                <circle cx="60" cy="290" r="3.5" stroke="#ff704f" strokeWidth="1" fill="none" opacity="0.7" />
                <circle cx="445" cy="135" r="3" stroke="#ff704f" strokeWidth="1" fill="none" opacity="0.75" />
              </svg>
            </motion.div>

            {/* Static Crosshair Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 580 580"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="290"
                y1="35"
                x2="290"
                y2="545"
                stroke="rgba(229, 101, 72, 0.28)"
                strokeWidth="0.85"
              />
              <line
                x1="35"
                y1="290"
                x2="545"
                y2="290"
                stroke="rgba(229, 101, 72, 0.28)"
                strokeWidth="0.85"
              />
            </svg>
          </div>

          {/* ── Enhanced N Logo: 3D Depth, Metallic Chamfer & Tactile Contoured Well ── */}
          <div
            className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-[38px] sm:rounded-[44px] md:rounded-[50px] p-2.5 sm:p-3 flex items-center justify-center transition-transform duration-300"
            style={{
              background: 'linear-gradient(145deg, #2a2730 0%, #1a1820 40%, #0d0c11 100%)',
              borderTop: '1.5px solid rgba(255, 120, 80, 0.8)',
              borderRight: '1.5px solid rgba(255, 95, 55, 0.6)',
              borderBottom: '1.5px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '1.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `
                0 0 55px -8px rgba(255, 87, 34, 0.5),
                0 28px 56px -14px rgba(0, 0, 0, 0.95),
                inset 0 2px 3px rgba(255, 255, 255, 0.26),
                inset 0 -3px 8px rgba(0, 0, 0, 0.85)
              `,
              transform: 'translateZ(0)',
            }}
          >
            {/* Inner Recessed Cavity with Topographic Wave Contours */}
            <div
              className="relative w-full h-full rounded-[30px] sm:rounded-[36px] md:rounded-[42px] overflow-hidden bg-[#070709] flex items-center justify-center"
              style={{
                boxShadow: 'inset 0 4px 18px rgba(0, 0, 0, 0.95), inset 0 0 12px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Subtle Damascus/Topographic Isobar Wave Texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(255, 112, 79, 0.15) 41%, transparent 42%),
                    radial-gradient(ellipse 85% 85% at 50% 50%, transparent 60%, rgba(255, 112, 79, 0.12) 61%, transparent 62%),
                    radial-gradient(ellipse 100% 100% at 50% 50%, transparent 80%, rgba(255, 112, 79, 0.1) 81%, transparent 82%)
                  `,
                }}
              />

              {/* ThreeUI Lightning Canvas with Calibrated Orange-White Palette */}
              <ElementsCollection
                variant="lightning"
                mark="n"
                speed={1.0}
                size={1.12}
                particleAmount={1.25}
                hue={175}
                saturation={1.8}
                brightness={1.25}
                opacity={1.0}
                className="w-full h-full"
              />

              {/* Vertex Starburst Optical Glints (Corner vertices of the N) */}
              <div
                className="absolute bottom-[28%] left-[27%] w-4 h-4 pointer-events-none opacity-85"
                aria-hidden="true"
              >
                <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#ff704f]" />
                <div className="absolute inset-0 m-auto w-3.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute inset-0 m-auto w-[1px] h-3.5 bg-gradient-to-b from-transparent via-white to-transparent" />
              </div>

              <div
                className="absolute top-[28%] right-[27%] w-4 h-4 pointer-events-none opacity-85"
                aria-hidden="true"
              >
                <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#ff704f]" />
                <div className="absolute inset-0 m-auto w-3.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute inset-0 m-auto w-[1px] h-3.5 bg-gradient-to-b from-transparent via-white to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Glowing Focal Hotspot / Lens Flare (Between Logo and Loading Bar) ── */}
        <div className="relative w-full flex items-center justify-center my-4 sm:my-5">
          <div className="relative flex items-center justify-center">
            {/* White-Hot Core */}
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff,0_0_12px_#ff704f,0_0_24px_#ff5722]" />
            {/* Horizontal Anamorphic Flare Streak */}
            <div className="absolute w-36 sm:w-56 h-[1.5px] bg-gradient-to-r from-transparent via-[#ff784f] to-transparent blur-[0.5px]" />
            {/* Radial Flare Halo */}
            <div
              className="absolute w-28 h-10 rounded-full blur-md opacity-70 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 112, 79, 0.7) 0%, rgba(229, 80, 45, 0.3) 50%, transparent 80%)',
              }}
            />
          </div>
        </div>

        {/* ── Dynamic Loading Bar: Glassmorphic Pill Capsule + Molten Fluid Glow + Percentage ── */}
        <div className="w-full max-w-[560px] sm:max-w-[640px] md:max-w-[700px] flex flex-col items-center">
          <div className="w-full flex items-center justify-center gap-4 sm:gap-5">
            {/* Glassmorphic Capsule Track */}
            <div
              className="relative flex-1 h-7 sm:h-8 rounded-full p-1 flex items-center overflow-hidden"
              style={{
                background: 'rgba(18, 16, 23, 0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgba(255, 120, 80, 0.45)',
                boxShadow: `
                  0 0 24px -4px rgba(255, 87, 34, 0.3),
                  inset 0 2px 4px rgba(0, 0, 0, 0.85),
                  0 10px 24px rgba(0, 0, 0, 0.7)
                `,
              }}
            >
              {/* Molten Fluid Gradient Fill */}
              <div
                className="relative h-full rounded-full transition-all duration-100 ease-out flex items-center justify-end"
                style={{
                  width: `${Math.max(1.5, progress)}%`,
                  background: 'linear-gradient(90deg, rgba(229, 70, 35, 0.45) 0%, rgba(255, 95, 45, 0.85) 60%, rgba(255, 125, 75, 0.95) 88%, #ffffff 100%)',
                  boxShadow: '0 0 14px rgba(255, 87, 34, 0.75), 0 0 28px rgba(229, 70, 35, 0.45)',
                }}
              >
                {/* Luminous Leading Edge Glint */}
                <div
                  className="w-2.5 h-full rounded-full bg-white opacity-95 shrink-0"
                  style={{
                    boxShadow: '0 0 10px #ffffff, 0 0 18px #ff704f',
                  }}
                />
              </div>
            </div>

            {/* Percentage Indicator Aligned Beside the Bar */}
            <div className="font-mono text-sm sm:text-base font-bold tracking-wider text-zinc-300 min-w-[3.5ch] text-left select-none">
              {roundedPct}%
            </div>
          </div>

          {/* ── Creative Loading Text & Inspiring Portfolio Philosophy ── */}
          <div className="mt-5 sm:mt-6 flex flex-col items-center text-center">
            {/* Primary Headline */}
            <span className="font-mono text-xs sm:text-[13px] tracking-[0.38em] text-white/90 font-medium uppercase select-none">
              INITIALIZING EXPERIENCE
            </span>

            {/* Inspiring Philosophy Message Matching Portfolio Theme */}
            <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono tracking-[0.42em] uppercase font-semibold text-[#df5035]/95 select-none">
              <span>BUILD</span>
              <span className="text-zinc-600">·</span>
              <span>BREAK</span>
              <span className="text-zinc-600">·</span>
              <span>REBUILD</span>
            </div>

            {/* Subtle Centered Accent Indicator */}
            <div
              className="mt-3.5 w-6 h-[2.5px] rounded-full bg-[#df5035]"
              style={{
                boxShadow: '0 0 8px rgba(223, 80, 53, 0.85)',
              }}
            />
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
