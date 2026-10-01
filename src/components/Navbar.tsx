import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { createTopDockController } from '../utils/topDockController';

interface NavbarProps {
  statusText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  statusText = 'AVAILABLE FOR OPPORTUNITIES',
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
    { label: 'ABOUT', href: '#about' },
    { label: 'WORK', href: '#work' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
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
              ? 'clay-surface shadow-[0_12px_28px_-6px_rgba(180,165,148,0.3)] bg-white/90 backdrop-blur-md border border-white/80'
              : 'bg-transparent'
          }`}
        >
          {/* Left: Brand Monogram / Identity */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base tracking-widest font-display font-bold text-[#1f1c19] uppercase transition-colors shrink-0"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg clay-btn flex items-center justify-center text-xs sm:text-sm font-mono font-black text-[#c4543f]">
              N
            </span>
            <span className="font-display font-extrabold tracking-wider text-[14px] sm:text-base">NITHISH S</span>
          </a>

          {/* Center: Clean Typography Links with ThreeUI AnimatedTopDock Proximity Spring */}
          {/* Tablet (md) and Desktop (lg) */}
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
                className="relative inline-flex items-center justify-center text-[11px] sm:text-[12px] lg:text-[13px] font-mono tracking-wider lg:tracking-widest text-[#5e5852] font-semibold rounded-full border border-transparent cursor-pointer select-none no-underline transition-colors"
                style={{
                  height: '34px',
                  padding: '0 14px',
                  boxSizing: 'border-box',
                  transformOrigin: '50% 0',
                  willChange: 'width, height, transform',
                }}
              >
                <span className="relative z-10 pointer-events-none">{link.label}</span>
                <span
                  data-dock-indicator
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[1.5px] bg-[#c4543f] rounded-full pointer-events-none transition-all duration-150"
                  style={{ width: '0px', opacity: 0 }}
                />
              </a>
            ))}
          </nav>

          {/* Right: Tactile Clay Status Indicator */}
          {/* Desktop (>= 1024px): Full text; Tablet (768px-1023px): Compact text to avoid crowding */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl clay-inset shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df6b55] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c4543f]"></span>
            </span>
            <span className="text-[10px] lg:text-[11px] font-mono tracking-wider text-[#5e5852] whitespace-nowrap select-none uppercase font-semibold">
              <span className="hidden lg:inline">{statusText}</span>
              <span className="lg:hidden">AVAILABLE</span>
            </span>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl clay-btn text-[#5e5852] hover:text-[#1f1c19] focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
            <div className="clay-card p-5 bg-white/95 backdrop-blur-md shadow-xl">
              <div className="flex flex-col gap-4">
                {/* Mobile Availability */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ded4]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df6b55] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c4543f]"></span>
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-[#5e5852] uppercase font-semibold">
                    {statusText}
                  </span>
                </div>

                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-1.5">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#c4543f] py-2.5 px-3.5 rounded-xl hover:bg-[#faf6f0] transition-colors font-semibold flex items-center min-h-[44px]"
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
