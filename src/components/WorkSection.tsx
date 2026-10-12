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

  return (
    <section id="work" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-white/[0.08]">
        <div data-ps className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#df5035] font-bold">02</span>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">/ ARCHIVE</span>
        </div>
        <div data-ps className="text-xs font-mono tracking-widest text-zinc-500 uppercase font-medium">
          CURATED PORTFOLIO
        </div>
      </div>

      {/* Main Title Row */}
      <div className="py-10 sm:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 data-ps className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-white uppercase select-none">
              SELECTED WORK
            </h2>
          </div>
          <div data-ps className="max-w-md">
            <p className="text-sm font-sans text-zinc-400 leading-relaxed text-balance">
              Architectural engineering and product implementations. Presenting systems design, research prototypes, and production code.
            </p>
          </div>
        </div>
      </div>

      {/* Project Showcase List — Elevated Clay Cards */}
      <div className="space-y-10 sm:space-y-12">
        {projects.map((project, index) => (
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
