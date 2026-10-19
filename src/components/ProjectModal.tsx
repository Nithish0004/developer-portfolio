import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Project } from '../types/portfolio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowY = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Dark Obsidian Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container — Tactile Dark Clay Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="clay-card relative w-full max-w-5xl bg-[#0e0e12]/95 border border-white/10 p-5 sm:p-8 md:p-10 z-10 my-auto shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
        >
          {/* Top Bar with Number and Close */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg clay-inset flex items-center justify-center font-mono text-xs font-bold text-[#df5035]">
                {project.number}
              </span>
              <span className="font-mono text-xs text-zinc-400 tracking-widest font-semibold uppercase">
                PROJECT // {project.year || '2025'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="clay-btn p-2 text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left: Project Image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-md bg-[#121217]">
                <img
                  src={project.image}
                  alt={project.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
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
              </div>
            </div>

            {/* Right: Project Details */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {project.name}
                </h3>
                {project.tagline && (
                  <p className="text-sm font-sans text-[#df5035] font-semibold">
                    {project.tagline}
                  </p>
                )}
                <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                  {project.description}
                </p>

                {/* Key Metrics */}
                {project.metrics && project.metrics.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {project.metrics.map((m) => (
                      <div key={m.label} className="clay-inset p-2.5 rounded-xl text-center">
                        <span className="block text-[10px] font-mono text-zinc-500 uppercase">{m.label}</span>
                        <span className="text-xs font-mono font-bold text-white">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Architecture Highlights */}
                {project.architecturePoints && project.architecturePoints.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[11px] font-mono tracking-widest text-zinc-500 uppercase font-semibold pb-1.5">
                      ENGINEERING HIGHLIGHTS
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                      {project.architecturePoints.map((pt, i) => (
                        <li key={i} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Technologies (Clean text with dividers) */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <span className="block text-[11px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
                  STACK &amp; ARCHITECTURE
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-400">
                  {project.technologies.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      <span className="font-medium">{tech}</span>
                      {idx < project.technologies.length - 1 && (
                        <span className="text-zinc-600 select-none">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.08]">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn inline-flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-300 hover:text-white uppercase px-4 py-2.5 font-semibold"
                  >
                    <Github size={14} />
                    <span>GITHUB</span>
                    <ArrowUpRight size={12} className="text-zinc-500" />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-accent inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase px-4 py-2.5 font-semibold"
                  >
                    <ExternalLink size={14} />
                    <span>LIVE DEMO</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
