import React from 'react';

interface NMonogramLayerProps {
  mouseOffset: { x: number; y: number };
  isExiting: boolean;
  uplinkProgress?: number;
  uplinkPhase?: string;
}

/**
 * Clean, cinematic identity layer for NITHISH S.
 * Displays an architectural, fully formed luminous "N" emblem
 * paired with bold cinematic typography, subtle HUD coordinates,
 * and high-contrast obsidian-crimson depth.
 * Zero slow stroke-drawing or pen animations.
 */
export const NMonogramLayer: React.FC<NMonogramLayerProps> = ({
  mouseOffset,
  isExiting,
  uplinkProgress = 0,
}) => {
  return (
    <div
      className="relative z-20 flex flex-col items-center justify-center text-center select-none pointer-events-none transition-all duration-700"
      style={{
        transform: `translate(${mouseOffset.x * 6}px, ${mouseOffset.y * 6}px)`,
        opacity: isExiting ? 0.95 : 1,
      }}
    >
      {/* ── AMBIENT BACKDROP RADIANCE RING ── */}
      <div
        className="absolute -inset-16 rounded-full blur-3xl transition-opacity duration-1000 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(225, 29, 72, 0.28) 0%, rgba(159, 18, 57, 0.15) 45%, transparent 70%)',
          transform: isExiting ? 'scale(1.2)' : 'scale(1.0)',
        }}
      />

      {/* ── ARCHITECTURAL CORNER CROSSHAIRS ── */}
      <div className="relative p-6 sm:p-8 flex flex-col items-center">
        {/* Top-Left Crosshair */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500/40" />
        {/* Top-Right Crosshair */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500/40" />
        {/* Bottom-Left Crosshair */}
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500/40" />
        {/* Bottom-Right Crosshair */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500/40" />

        {/* ── FULLY FORMED CINEMATIC "N" EMBLEM (Clean, Solid, Luminous) ── */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            width="104"
            height="104"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-500"
            style={{
              filter: isExiting
                ? 'drop-shadow(0 0 24px rgba(244, 63, 94, 0.9)) drop-shadow(0 0 45px rgba(225, 29, 72, 0.8))'
                : 'drop-shadow(0 0 16px rgba(244, 63, 94, 0.55)) drop-shadow(0 0 30px rgba(225, 29, 72, 0.35))',
            }}
          >
            <defs>
              <linearGradient id="n-stem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>

              <linearGradient id="n-diag-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>

              <linearGradient id="n-glow-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(244, 63, 94, 0.7)" />
                <stop offset="100%" stopColor="rgba(136, 19, 55, 0.1)" />
              </linearGradient>
            </defs>

            {/* Subtle Circular Tech Dial Border */}
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="url(#n-glow-ring)"
              strokeWidth="1.25"
              strokeDasharray="4 6"
              className="animate-[spin_40s_linear_infinite]"
            />
            <circle
              cx="50"
              cy="50"
              r="41"
              stroke="rgba(244, 63, 94, 0.2)"
              strokeWidth="0.75"
            />

            {/* Solid Architectural "N" Monogram */}
            {/* Left Stem */}
            <rect
              x="25"
              y="22"
              width="11"
              height="56"
              rx="2.5"
              fill="url(#n-stem-gradient)"
            />
            {/* Diagonal Beam */}
            <polygon
              points="27,22 41,22 75,76 61,76"
              fill="url(#n-diag-gradient)"
            />
            {/* Right Stem */}
            <rect
              x="64"
              y="22"
              width="11"
              height="56"
              rx="2.5"
              fill="url(#n-stem-gradient)"
            />

            {/* High-Contrast Luminous Inner Hairlines */}
            <line
              x1="30.5"
              y1="25"
              x2="30.5"
              y2="75"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.85"
            />
            <line
              x1="33"
              y1="25"
              x2="67"
              y2="75"
              stroke="#ffffff"
              strokeWidth="1.4"
              opacity="0.95"
            />
            <line
              x1="69.5"
              y1="25"
              x2="69.5"
              y2="75"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* ── PROMINENT IDENTITY TYPOGRAPHY ── */}
        <div className="space-y-2">
          {/* System Pre-Header */}
          <div className="flex items-center justify-center gap-2 text-[9px] font-mono tracking-[0.34em] text-rose-400/80 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>PORTFOLIO MATRIX // 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>

          {/* Main Name Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.32em] uppercase text-white font-sans drop-shadow-[0_0_24px_rgba(244,63,94,0.6)]">
            NITHISH S
          </h1>

          {/* Subtitle / Role */}
          <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] text-neutral-400 uppercase pt-0.5">
            CREATIVE TECHNOLOGIST <span className="text-rose-500/70">•</span> DESIGN ENGINEER
          </p>
        </div>
      </div>
    </div>
  );
};
