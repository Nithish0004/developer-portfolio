import React from 'react';
import { Github, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Project } from '../types/portfolio';

interface ProjectShowcaseItemProps {
  project: Project;
  index: number;
  onSelectProject: (project: Project) => void;
}

export const ProjectShowcaseItem: React.FC<ProjectShowcaseItemProps> = ({
  project,
  index,
  onSelectProject,
}) => {
  const isEven = index % 2 === 0;

  return (
    <article
      className="clay-card p-6 sm:p-8 md:p-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Editorial Text Column */}
        <div
          className={`lg:col-span-5 flex flex-col justify-between space-y-5 ${
            isEven ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          {/* Top Identifier Row */}
          <div data-ps className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg clay-inset flex items-center justify-center font-mono text-xs font-bold text-[#df5035]">
              {project.number}
            </span>
            <span className="w-6 h-[1.5px] bg-white/[0.08]" />
            <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase font-medium">
              {project.year || '2025'} // SYSTEM
            </span>
          </div>

          {/* Project Title */}
          <div data-ps className="space-y-1.5">
            <h3
              onClick={() => onSelectProject(project)}
              className="cursor-pointer font-display font-bold text-2xl sm:text-3xl text-white tracking-[-0.03em] leading-tight hover:text-[#df5035] transition-colors inline-block"
            >
              {project.name}
            </h3>
            {project.tagline && (
              <p className="text-sm font-sans text-zinc-400 font-medium">
                {project.tagline}
              </p>
            )}
          </div>

          {/* Short Description */}
          <p data-ps className="text-sm sm:text-base font-sans text-zinc-300 leading-relaxed text-balance">
            {project.description}
          </p>

          {/* Technologies: Clean unboxed text with dividers (Zero-pill rule) */}
          <div data-ps className="pt-2">
            <span className="block text-[11px] font-mono tracking-widest text-zinc-500 uppercase pb-2 font-semibold">
              TECHNOLOGIES
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-400">
              {project.technologies.map((tech, techIdx) => (
                <React.Fragment key={tech}>
                  <span className="hover:text-[#df5035] transition-colors font-medium">
                    {tech}
                  </span>
                  {techIdx < project.technologies.length - 1 && (
                    <span className="text-zinc-600 select-none">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action Links with Tactile Clay Buttons */}
          <div data-ps className="flex flex-wrap items-center gap-3 pt-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn inline-flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-300 hover:text-white uppercase px-4 py-2.5 font-semibold transition-all cursor-pointer"
                aria-label={`View ${project.name} on GitHub`}
              >
                <Github size={14} />
                <span>CODE</span>
                <ArrowUpRight size={12} className="text-zinc-500" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn-accent inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase px-4 py-2.5 font-semibold transition-all cursor-pointer"
                aria-label={`View live demo for ${project.name}`}
              >
                <ExternalLink size={14} />
                <span>DEMO</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => onSelectProject(project)}
              className="clay-btn inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-zinc-400 hover:text-white uppercase px-3.5 py-2.5 font-semibold cursor-pointer"
            >
              DETAILS
            </button>
          </div>
        </div>

        {/* Large Editorial Image Preview Column */}
        <div
          className={`lg:col-span-7 ${
            isEven ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <div
            onClick={() => onSelectProject(project)}
            className="group/image relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)] bg-[#0d0d12] cursor-pointer"
          >
            {/* Corner Bracket / Editorial Mark */}
            <div className="absolute top-4 left-4 z-20 font-mono text-[10px] text-zinc-300 tracking-widest uppercase bg-[#09090c]/85 border border-white/10 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md font-semibold">
              FIG. {project.number}
            </div>

            {/* Image with smooth scale */}
            <img
              data-ps
              src={project.image}
              alt={project.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.03]"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add('flex', 'items-center', 'justify-center', 'p-8');
                  parent.innerHTML = `<span class="font-mono text-xs text-zinc-500 uppercase tracking-widest font-semibold">${project.name}</span>`;
                }
              }}
            />

            {/* Dark gradient bottom scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/75 via-transparent to-transparent pointer-events-none" />

            {/* Hover Expand Badge */}
            <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <span className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono tracking-widest text-white uppercase font-semibold">
                EXPAND <ArrowUpRight size={13} className="text-[#df5035]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
