import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, Copy, Check, ExternalLink, GraduationCap, Award, Code, Database, Cpu } from 'lucide-react';
import { personalInfo, resumeData, sampleProjects } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowY = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    onShowToast?.('Portfolio link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="clay-card relative w-full max-w-4xl bg-[#0d0d11]/98 border border-white/10 p-5 sm:p-8 md:p-10 z-10 my-auto shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto"
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg clay-inset flex items-center justify-center font-mono text-xs font-bold text-[#df5035]">
                CV
              </span>
              <span className="font-mono text-xs text-zinc-400 tracking-widest font-semibold uppercase">
                CURRICULUM VITAE // CREDENTIALS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider text-zinc-300 hover:text-white uppercase font-semibold cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer size={13} className="text-[#df5035]" />
                <span className="hidden sm:inline">PRINT / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider text-zinc-300 hover:text-white uppercase font-semibold cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check size={13} className="text-[#df5035]" /> : <Copy size={13} />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'SHARE'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="clay-btn p-2 text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Resume Body */}
          <div className="py-6 space-y-8 select-text">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                  {personalInfo.name}
                </h2>
                <p className="font-mono text-sm text-[#df5035] font-semibold mt-1">
                  {personalInfo.shortBio}
                </p>
                <p className="text-xs text-zinc-400 font-sans mt-1">
                  {personalInfo.institution}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1 font-mono text-xs text-zinc-400">
                <a
                  href={`mailto:${personalInfo.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {personalInfo.contact.email}
                </a>
                <a
                  href={personalInfo.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>github.com/nithishs</span>
                  <ExternalLink size={10} />
                </a>
                <a
                  href={personalInfo.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>linkedin.com/in/nithish-s1</span>
                  <ExternalLink size={10} />
                </a>
                <span className="text-zinc-500">Bengaluru, Karnataka, India</span>
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#df5035] tracking-widest uppercase font-bold">
                <GraduationCap size={15} />
                <span>EDUCATION</span>
              </div>

              <div className="clay-surface p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-display font-bold text-base text-white">
                    {resumeData.education.degree}
                  </h3>
                  <span className="font-mono text-xs text-zinc-400 font-semibold">
                    {resumeData.education.period}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">
                  {resumeData.education.institution} • {resumeData.education.location}
                </p>

                {/* Coursework Badges */}
                <div className="pt-2">
                  <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider pb-1.5 font-semibold">
                    RELEVANT COURSEWORK
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.education.coursework.map((course) => (
                      <span
                        key={course}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-zinc-300"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Competencies */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#df5035] tracking-widest uppercase font-bold">
                <Cpu size={15} />
                <span>CORE STRENGTHS & TECHNICAL FOCUS</span>
              </div>

              <div className="clay-surface p-5 space-y-2">
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside">
                  {resumeData.coreStrengths.map((str, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key Technical Projects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#df5035] tracking-widest uppercase font-bold">
                <Code size={15} />
                <span>FEATURED ENGINEERING PROJECTS</span>
              </div>

              <div className="space-y-3">
                {sampleProjects.map((project) => (
                  <div key={project.id} className="clay-surface p-5 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-display font-bold text-base text-white">
                        {project.name}
                      </h4>
                      <span className="font-mono text-xs text-zinc-400 font-semibold">
                        {project.year} // {project.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Architecture Highlights */}
                    {project.architecturePoints && (
                      <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside pt-1">
                        {project.architecturePoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    )}

                    {/* Tech & Metrics */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {project.metrics && (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#df5035] font-semibold">
                          {project.metrics.map((m) => (
                            <span key={m.label}>
                              {m.label}: {m.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
