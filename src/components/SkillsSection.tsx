import React, { useState } from 'react';
import { motion } from 'motion/react';
import { skillCategories } from '../data/portfolioData';

export const SkillsSection: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="skills" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full border-t border-white/[0.08]">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#df5035] font-bold">03</span>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">/ CAPABILITIES</span>
        </div>
        <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">
          TECHNICAL STACK
        </div>
      </div>

      {/* Main Title Row */}
      <div className="py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h2 data-ps className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-white uppercase select-none">
              SKILLS
            </h2>
          </div>
          <div className="max-w-md">
            <p data-ps className="text-sm font-sans text-zinc-400 leading-relaxed text-balance">
              Core technologies, machine learning frameworks, and infrastructure tools applied across software products and academic research.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tactile Clay Cards Grid (4 Categories, Clean Editorial Rigor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
        {skillCategories.map((group, groupIdx) => (
          <motion.div
            key={group.category}
            data-ps
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: groupIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="clay-surface p-6 sm:p-7 flex flex-col space-y-5"
          >
            {/* Category Title */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-display font-bold text-base text-white tracking-tight uppercase">
                {group.category}
              </h3>
              <span className="font-mono text-xs text-zinc-500 font-semibold">
                0{groupIdx + 1}
              </span>
            </div>

            {/* Clean Typography List of Technologies */}
            <ul className="flex flex-col space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  onMouseEnter={() => setHoveredSkill(item)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="group flex items-center justify-between py-1 transition-all duration-200 cursor-default"
                >
                  <span
                    className={`font-sans text-sm transition-all duration-200 ${
                      hoveredSkill === item
                        ? 'text-[#df5035] font-semibold translate-x-1'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item}
                  </span>

                  {/* Subtle accent indicator on hover */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-[#df5035] shadow-[0_0_8px_#df5035] transition-all duration-200 ${
                      hoveredSkill === item ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Minimal Footer Note */}
      <div className="mt-14 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs font-mono text-zinc-500 uppercase tracking-widest font-medium text-center sm:text-left">
        <span>ZERO SYNTHETIC BARS</span>
        <span>TESTED ON REAL WORKLOADS</span>
      </div>
    </section>
  );
};
