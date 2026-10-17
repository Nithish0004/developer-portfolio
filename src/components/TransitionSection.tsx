import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const TransitionSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Subtle horizontal parallax on scroll
  const x1 = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const x2 = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const x3 = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  const words = [
    { text: 'BUILD.', transform: x1, color: 'text-white' },
    { text: 'BREAK.', transform: x2, color: 'text-zinc-600 hover:text-[#df5035]' },
    { text: 'REBUILD.', transform: x3, color: 'text-white' },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-24 sm:py-32 md:py-40 overflow-hidden bg-[#0a0a0d] border-y border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 relative z-10">
        {/* Subtle Top Metadata Line */}
        <div className="flex items-center justify-between text-xs font-mono tracking-widest text-zinc-500 uppercase pb-8 sm:pb-12 border-b border-white/[0.08]">
          <span>00 / PHILOSOPHY</span>
          <span className="flex items-center gap-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#df5035] shadow-[0_0_6px_#df5035]" />
            ITERATIVE SYSTEMS
          </span>
        </div>

        {/* Oversized Typographic Words */}
        <div className="py-10 sm:py-14 flex flex-col space-y-2 sm:space-y-3 select-none">
          {words.map((item, idx) => (
            <motion.div
              key={item.text}
              style={{ x: item.transform, transform: 'translateZ(0)' }}
              className="flex items-baseline gap-4 sm:gap-8 will-change-[transform]"
            >
              <span className="font-mono text-xs sm:text-sm text-zinc-600 tracking-wider font-semibold">
                0{idx + 1}
              </span>
              <h2
                data-ps
                className={`font-display font-black text-5xl sm:text-7xl md:text-9xl lg:text-[10.5rem] xl:text-[12rem] tracking-[-0.05em] leading-[0.80] transition-colors duration-300 ${item.color}`}
              >
                {item.text}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Bottom Editorial Caption */}
        <div className="pt-8 sm:pt-12 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <p className="max-w-md text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
            Engineering resilient software through relentless stress testing, deep curiosity, and architectural refinement.
          </p>
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
            CORE DISCIPLINE
          </span>
        </div>
      </div>
    </section>
  );
};
