import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  statusText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  statusText = 'AVAILABLE FOR OPPORTUNITIES',
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
        scrolled ? 'py-3' : 'py-5 sm:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-3 transition-all duration-300 rounded-2xl ${
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
            className="group flex items-center gap-2.5 text-sm tracking-widest font-display font-bold text-[#1f1c19] uppercase transition-colors"
          >
            <span className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-xs font-mono font-black text-[#c4543f]">
              N
            </span>
            <span className="font-display font-extrabold tracking-wider">NITHISH S</span>
          </a>

          {/* Center: Clean Typography Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] transition-colors duration-200 relative group py-1 select-none"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#c4543f] transition-all duration-300 ease-out group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right: Tactile Clay Status Indicator */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl clay-inset">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df6b55] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c4543f]"></span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#5e5852] whitespace-nowrap select-none uppercase font-medium">
              {statusText}
            </span>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl clay-btn text-[#5e5852] hover:text-[#1f1c19] focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
            className="md:hidden max-w-7xl mx-auto px-6 pt-2"
          >
            <div className="clay-card p-6 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col gap-5">
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
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#c4543f] py-2 px-3 rounded-lg hover:bg-[#faf6f0] transition-colors"
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
