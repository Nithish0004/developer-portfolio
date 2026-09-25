import React, { useState } from 'react';
import { motion } from 'motion/react';
import { skillCategories } from '../data/portfolioData';

export const SkillsSection: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="skills" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full border-t border-[#e5ded4]">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-[#e5ded4]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#c4543f] font-bold">03</span>
          <span className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">/ CAPABILITIES</span>
        </div>
        <div className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">
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
            <h2 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-[#1f1c19] uppercase select-none">
              SKILLS
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm font-sans text-[#5e5852] leading-relaxed text-balance">
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: groupIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="clay-surface p-6 sm:p-7 flex flex-col space-y-5"
          >
            {/* Category Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ede7de]">
              <h3 className="font-display font-bold text-base text-[#1f1c19] tracking-tight uppercase">
                {group.category}
              </h3>
              <span className="font-mono text-xs text-[#8a8175] font-semibold">
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
                        ? 'text-[#c4543f] font-semibold translate-x-1'
                        : 'text-[#5e5852] hover:text-[#1f1c19]'
                    }`}
                  >
                    {item}
                  </span>

                  {/* Subtle accent indicator on hover */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-[#c4543f] transition-all duration-200 ${
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
      <div className="mt-14 pt-6 border-t border-[#e5ded4] flex items-center justify-between text-xs font-mono text-[#8a8175] uppercase tracking-widest font-medium">
        <span>ZERO SYNTHETIC BARS</span>
        <span>TESTED ON REAL WORKLOADS</span>
      </div>
    </section>
  );
};
