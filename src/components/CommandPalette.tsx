import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, ArrowRight, Copy, Check, Volume2, VolumeX, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
  onToggleSound: () => void;
  isSoundMuted: boolean;
  onShowToast: (message: string) => void;
}

interface ActionItem {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'SOCIAL';
  shortcut?: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenResume,
  onToggleSound,
  isSoundMuted,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.contact.email);
    onClose();
    onShowToast('Email copied to clipboard!');
  };

  const actions: ActionItem[] = [
    {
      id: 'nav-about',
      title: 'Go to About & Profile',
      category: 'NAVIGATION',
      shortcut: 'G A',
      icon: <ArrowRight size={14} className="text-[#df5035]" />,
      run: () => scrollTo('about'),
    },
    {
      id: 'nav-work',
      title: 'Go to Selected Work',
      category: 'NAVIGATION',
      shortcut: 'G W',
      icon: <ArrowRight size={14} className="text-[#df5035]" />,
      run: () => scrollTo('work'),
    },
    {
      id: 'nav-skills',
      title: 'Go to Skills & Capabilities',
      category: 'NAVIGATION',
      shortcut: 'G S',
      icon: <ArrowRight size={14} className="text-[#df5035]" />,
      run: () => scrollTo('skills'),
    },
    {
      id: 'nav-contact',
      title: 'Go to Contact & Direct Line',
      category: 'NAVIGATION',
      shortcut: 'G C',
      icon: <ArrowRight size={14} className="text-[#df5035]" />,
      run: () => scrollTo('contact'),
    },
    {
      id: 'action-resume',
      title: 'View Resume & Credentials',
      category: 'ACTIONS',
      shortcut: '⌘ R',
      icon: <FileText size={14} className="text-[#df5035]" />,
      run: () => {
        onClose();
        onOpenResume();
      },
    },
    {
      id: 'action-copy-email',
      title: `Copy Email (${personalInfo.contact.email})`,
      category: 'ACTIONS',
      shortcut: '⌘ E',
      icon: <Mail size={14} className="text-[#df5035]" />,
      run: copyEmail,
    },
    {
      id: 'action-sound',
      title: isSoundMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound',
      category: 'ACTIONS',
      shortcut: '⌘ M',
      icon: isSoundMuted ? <VolumeX size={14} className="text-zinc-400" /> : <Volume2 size={14} className="text-[#df5035]" />,
      run: () => {
        onToggleSound();
        onShowToast(isSoundMuted ? 'Ambient audio unmuted' : 'Ambient audio muted');
      },
    },
    {
      id: 'social-github',
      title: 'Open GitHub Profile',
      category: 'SOCIAL',
      icon: <Github size={14} className="text-zinc-300" />,
      run: () => window.open(personalInfo.contact.github, '_blank'),
    },
    {
      id: 'social-linkedin',
      title: 'Open LinkedIn Profile',
      category: 'SOCIAL',
      icon: <Linkedin size={14} className="text-zinc-300" />,
      run: () => window.open(personalInfo.contact.linkedin, '_blank'),
    },
  ];

  const filtered = actions.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase()) ||
    act.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].run();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Palette Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="clay-card relative w-full max-w-xl bg-[#0e0e12]/98 border border-white/12 p-3 sm:p-4 z-10 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-3 py-2.5 clay-inset rounded-xl border border-white/10">
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none font-sans"
            />
            <span className="font-mono text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 rounded border border-white/10 shrink-0">
              ESC TO CLOSE
            </span>
          </div>

          {/* Action List */}
          <div className="mt-3 max-h-[320px] overflow-y-auto space-y-1 pr-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-zinc-500 uppercase">
                No matching commands found
              </div>
            ) : (
              filtered.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => item.run()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#df5035]/15 text-white border border-[#df5035]/30'
                        : 'text-zinc-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-xs sm:text-sm font-sans font-medium">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
                        {item.category}
                      </span>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-zinc-400">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="flex items-center justify-between pt-3 px-2 border-t border-white/[0.06] mt-3 text-[10px] font-mono text-zinc-500 uppercase">
            <span>↑↓ NAVIGATE</span>
            <span>↵ EXECUTE</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
