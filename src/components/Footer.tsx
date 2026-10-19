import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070709]/80 backdrop-blur-md py-10 sm:py-14 px-6 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Name */}
        <div className="text-center sm:text-left flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md clay-inset flex items-center justify-center text-[11px] font-mono font-black text-[#df5035]">
            N
          </span>
          <span className="font-display font-extrabold text-sm tracking-widest text-white uppercase">
            NITHISH S
          </span>
        </div>

        {/* Center: Philosophy / Built line */}
        <div className="text-center">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-semibold">
            BUILT WITH CODE &amp; CURIOSITY
          </span>
        </div>

        {/* Right: Dynamic Year & Back to top in Tactile Clay Button */}
        <div className="flex items-center gap-6 text-xs font-mono tracking-widest text-zinc-400">
          <span className="font-medium">&copy; {currentYear}</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="clay-btn flex items-center gap-1.5 px-3 py-1.5 hover:text-white transition-colors uppercase group cursor-pointer font-semibold"
            aria-label="Back to top"
          >
            <span>TOP</span>
            <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform text-[#df5035]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
