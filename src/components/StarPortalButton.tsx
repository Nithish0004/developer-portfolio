import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface StarPortalButtonProps {
  onActivate: () => void;
  isDissolving: boolean;
}

export const StarPortalButton: React.FC<StarPortalButtonProps> = ({
  onActivate,
  isDissolving,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{
        opacity: isDissolving ? 0 : 1,
        scale: isDissolving ? 1.3 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 1.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center z-50 pointer-events-auto select-none"
    >
      {/* Soft Ambient Clay Halo */}
      <div className="absolute -inset-8 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Main Tactile Clay Star Portal Button */}
      <button
        type="button"
        onClick={onActivate}
        className="group relative flex items-center gap-3.5 px-8 py-4 rounded-2xl bg-gradient-to-b from-[#2a282f] to-[#151418] border border-white/15 hover:border-white/30 text-white shadow-[0_18px_36px_rgba(0,0,0,0.65),inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5)] hover:shadow-[0_22px_44px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        aria-label="Enter Portfolio"
      >
        {/* Soft Tactile Icon Container */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-b from-white to-[#d4d0cb] text-[#141316] shadow-[0_2px_8px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Clean Minimal Clay Text */}
        <span className="font-sans font-bold text-sm tracking-[0.22em] text-white uppercase group-hover:text-white transition-colors">
          STAR PORTAL
        </span>

        <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </button>
    </motion.div>
  );
};
