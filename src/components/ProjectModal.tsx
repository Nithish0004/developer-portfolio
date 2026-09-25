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
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Warm Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2d2722]/50 backdrop-blur-md"
        />

        {/* Modal Container — Tactile Clay Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="clay-card relative w-full max-w-5xl bg-white/95 p-6 sm:p-8 md:p-10 z-10 my-auto shadow-2xl"
        >
          {/* Top Bar with Number and Close */}
          <div className="flex items-center justify-between pb-5 border-b border-[#e5ded4]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg clay-inset flex items-center justify-center font-mono text-xs font-bold text-[#c4543f]">
                {project.number}
              </span>
              <span className="font-mono text-xs text-[#8a8175] tracking-widest font-semibold uppercase">
                PROJECT // {project.year || '2025'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="clay-btn p-2 text-[#5e5852] hover:text-[#1f1c19] focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left: Project Image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-white shadow-md bg-[#ede7de]">
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
                      parent.innerHTML = `<span class="font-mono text-xs text-[#8a8175] uppercase tracking-widest font-semibold">${project.name}</span>`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Right: Project Details */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1f1c19] tracking-tight">
                  {project.name}
                </h3>
                {project.tagline && (
                  <p className="text-sm font-sans text-[#c4543f] font-semibold">
                    {project.tagline}
                  </p>
                )}
                <p className="text-sm text-[#5e5852] font-sans leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Technologies (Clean text with dividers) */}
              <div className="pt-4 border-t border-[#e5ded4] space-y-2">
                <span className="block text-[11px] font-mono tracking-widest text-[#8a8175] uppercase font-semibold">
                  STACK &amp; ARCHITECTURE
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#5e5852]">
                  {project.technologies.map((tech, idx) => (
                    <React.Fragment key={tech}>
                      <span className="font-medium">{tech}</span>
                      {idx < project.technologies.length - 1 && (
                        <span className="text-[#c4bbb0] select-none">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#e5ded4]">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase px-4 py-2.5 font-semibold"
                  >
                    <Github size={14} />
                    <span>GITHUB</span>
                    <ArrowUpRight size={12} />
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
