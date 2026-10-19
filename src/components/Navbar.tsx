import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Command, FileText, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { createTopDockController } from '../utils/topDockController';

interface NavbarProps {
  statusText?: string;
  onOpenResume?: () => void;
  onOpenCommandPalette?: () => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  statusText = 'AVAILABLE FOR OPPORTUNITIES',
  onOpenResume,
  onOpenCommandPalette,
  isSoundMuted = false,
  onToggleSound,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 30;
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ThreeUI AnimatedTopDock proximity-based spring interaction
  useEffect(() => {
    if (!navRef.current) return;
    const cleanup = createTopDockController(navRef.current, {
      proximity: 122,
      spring: 0.19,
      damping: 0.70,
      widthGrowth: 17,
      heightGrowth: 16,
      drop: 3.5,
    });
    return cleanup;
  }, []);

  const navLinks = [
    { label: 'Home', href: '#', isHome: true },
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2.5 sm:py-3' : 'py-3.5 sm:py-5 lg:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 rounded-2xl ${
            scrolled
              ? 'bg-[#09090b]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_-6px_rgba(0,0,0,0.8)]'
              : 'bg-transparent'
          }`}
        >
          {/* Left: Brand Monogram / Identity (Matching Proposed Redesign) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 sm:gap-3 text-sm sm:text-base font-display font-bold text-[#f4f4f5] uppercase transition-colors shrink-0"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-xs sm:text-sm font-display font-black text-[#09090b] shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              N
            </span>
            <span className="font-display font-black tracking-wider text-[15px] sm:text-lg text-white">
              NITHISH
            </span>
          </a>

          {/* Center: Clean Typography Links with ThreeUI AnimatedTopDock Proximity Spring */}
          <nav
            ref={navRef}
            className="hidden md:flex items-start justify-center gap-1 sm:gap-1.5 lg:gap-2 relative"
            aria-label="Primary"
            data-dock-state="idle"
            data-dock-max="0.00"
            style={{
              height: '34px',
              overflow: 'visible',
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                data-dock-item
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative inline-flex items-center justify-center text-[12px] lg:text-[13px] font-sans tracking-wide font-medium rounded-full border border-transparent cursor-pointer select-none no-underline transition-colors ${
                  link.isHome ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  boxSizing: 'border-box',
                  transformOrigin: '50% 0',
                  willChange: 'width, height, transform',
                }}
              >
                <span className="relative z-10 pointer-events-none flex flex-col items-center gap-0.5">
                  <span>{link.label}</span>
                  {link.isHome && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#df5035] shadow-[0_0_6px_#df5035]" />
                  )}
                </span>
                <span
                  data-dock-indicator
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[1.5px] bg-[#df5035] rounded-full pointer-events-none transition-all duration-150"
                  style={{ width: '0px', opacity: 0 }}
                />
              </a>
            ))}
          </nav>

          {/* Right Group: Resume, Let's Talk, Command Palette, Sound */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Command Palette Trigger */}
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="clay-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-400 hover:text-white cursor-pointer transition-all"
                title="Command Palette (⌘K)"
              >
                <Command size={12} className="text-[#df5035]" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">⌘K</span>
              </button>
            )}

            {/* Sound Toggle */}
            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                className="clay-btn p-2 text-zinc-400 hover:text-white cursor-pointer transition-all"
                title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isSoundMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#df5035]" />}
              </button>
            )}

            {/* Resume Button */}
            {onOpenResume && (
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121217]/90 border border-white/12 text-zinc-200 hover:text-white font-mono text-xs font-semibold tracking-wider hover:border-white/25 hover:bg-[#181820] transition-all cursor-pointer backdrop-blur-md shadow-sm"
                title="View Resume / CV"
              >
                <FileText size={14} className="text-zinc-400" />
                <span>Resume</span>
              </button>
            )}

            {/* Let's Talk Button (Glowing Volcanic Magma Pill) */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#e35639] via-[#df5035] to-[#c73e24] text-white font-mono text-xs font-semibold tracking-wider shadow-[0_0_18px_rgba(223,80,53,0.45)] hover:shadow-[0_0_26px_rgba(223,80,53,0.7)] hover:scale-105 transition-all cursor-pointer"
            >
              <span>Let&apos;s Talk</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                aria-label="Open Command Palette"
              >
                <Command size={16} className="text-[#df5035]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-7xl mx-auto px-4 pt-2"
          >
            <div className="p-5 rounded-2xl bg-[#0e0e12]/95 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col gap-4">
                {/* Mobile Availability & Quick Buttons */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df5035] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#df5035] shadow-[0_0_8px_#df5035]"></span>
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-semibold">
                      {statusText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onToggleSound && (
                      <button
                        type="button"
                        onClick={onToggleSound}
                        className="clay-btn p-1.5 text-zinc-400"
                        title="Toggle Sound"
                      >
                        {isSoundMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#df5035]" />}
                      </button>
                    )}
                    {onOpenResume && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenResume();
                        }}
                        className="clay-btn-accent text-[10px] font-mono px-2.5 py-1 uppercase font-bold"
                      >
                        RESUME
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-1.5">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-xs font-mono tracking-widest text-zinc-300 hover:text-[#df5035] py-2.5 px-3.5 rounded-xl hover:bg-white/5 transition-colors font-semibold flex items-center min-h-[44px]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
