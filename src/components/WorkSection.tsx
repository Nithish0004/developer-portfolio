import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Project } from '../types/portfolio';
import { ProjectShowcaseItem } from './ProjectShowcaseItem';
import { ProjectModal } from './ProjectModal';

interface WorkSectionProps {
  projects: Project[];
}

export const WorkSection: React.FC<WorkSectionProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SYSTEMS' | 'AI / ML' | 'INTERFACES'>('ALL');

  const categories: ('ALL' | 'SYSTEMS' | 'AI / ML' | 'INTERFACES')[] = ['ALL', 'SYSTEMS', 'AI / ML', 'INTERFACES'];

  const filteredProjects = activeCategory === 'ALL'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#df5035] font-bold">02</span>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">/ ARCHIVE</span>
        </div>
        <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">
          CURATED PORTFOLIO
        </div>
      </div>

      {/* Main Title Row & Category Filters */}
      <div className="py-10 sm:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 data-ps className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-white uppercase select-none">
              SELECTED WORK
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm font-sans text-zinc-400 leading-relaxed text-balance">
              Architectural engineering and product implementations. Presenting systems design, research prototypes, and production code.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-8">
          {categories.map((cat) => {
            const count = cat === 'ALL'
              ? projects.length
              : projects.filter((p) => p.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`clay-btn px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#df5035]/20 text-[#df5035] border-[#df5035]/40 shadow-[0_0_15px_rgba(223,80,53,0.2)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>{cat}</span>
                <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Showcase List — Elevated Clay Cards */}
      <div className="space-y-10 sm:space-y-12">
        {filteredProjects.map((project, index) => (
          <ProjectShowcaseItem
            key={project.id || project.number}
            project={project}
            index={index}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        ))}
      </div>

      {/* Lightbox / Full Project Modal in Clay Style */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
