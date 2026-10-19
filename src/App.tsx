import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TransitionSection } from './components/TransitionSection';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { ResumeModal } from './components/ResumeModal';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';
import { sampleProjects } from './data/portfolioData';
import { mountParticleScroll } from './utils/particleScroll';
import { cinematicAudio } from './utils/cinematicAudio';

export default function App() {
  const [transitionStage, setTransitionStage] = useState<'loading' | 'revealing' | 'completed'>('loading');
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      cinematicAudio.setMuted(next);
      return next;
    });
  }, []);

  // Keyboard shortcut listener for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize ThreeUI ParticleScroll on content elements below Hero with Dark Mode Obsidian & Magma Palette
  useEffect(() => {
    if (!isContentVisible) return;

    let psInstance: ReturnType<typeof mountParticleScroll> = null;
    const timer = setTimeout(() => {
      psInstance = mountParticleScroll('[data-ps]', {
        point: 0.60,
        band: 220,
        density: typeof window !== 'undefined' && window.innerWidth < 768 ? 2.5 : 2,
        size: 1.25,
        spread: 180,
        gravity: 0.28,
        drift: 0.6,
        swirl: 50,
        stagger: 0.35,
        fade: 0.85,
        settle: 0.24,
        hold: 0.34,
        smoothing: 0.16,
        tintA: [0.87, 0.31, 0.21], // Magma Crimson (#df5035)
        tintB: [1.00, 0.40, 0.26], // Bright Magma Orange (#ff6542)
        bg: [0.027, 0.027, 0.035], // Deep Obsidian (#070709)
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      psInstance?.destroy();
    };
  }, [isContentVisible]);

  const releaseScrollLock = useCallback(() => {
    document.body.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
  }, []);

  const handleUplinkComplete = useCallback(() => {
    // 1. Loading content pulls upward; blackish background center-split opening begins
    setTransitionStage('revealing');

    // 2. Bring the main-page text/content upward from below after background split is mostly open
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 1300);

    // 3. Unlock scroll as content settles into place
    const scrollTimer = setTimeout(() => {
      releaseScrollLock();
    }, 1850);

    // 4. Complete transition, unmount transition elements completely
    const completeTimer = setTimeout(() => {
      setTransitionStage('completed');
      releaseScrollLock();
    }, 2100);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(scrollTimer);
      clearTimeout(completeTimer);
    };
  }, [releaseScrollLock]);

  useEffect(() => {
    if (transitionStage === 'completed') {
      releaseScrollLock();
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }, [transitionStage, releaseScrollLock]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-[#f4f4f5] selection:bg-[#df5035] selection:text-white font-sans antialiased">
      {/* Ambient Volcanic Magma Atmospheric Lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        {/* Subtle radial magma glow behind mid-page */}
        <div
          className="absolute top-[32%] right-[-15%] w-[850px] h-[850px] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(223,80,53,0.35) 0%, rgba(184,56,34,0.08) 50%, transparent 75%)' }}
        />
        {/* Subtle radial magma glow behind contact area */}
        <div
          className="absolute bottom-[8%] left-[-15%] w-[750px] h-[750px] rounded-full blur-[130px] opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(223,80,53,0.3) 0%, rgba(184,56,34,0.05) 50%, transparent 75%)' }}
        />
        {/* Delicate technical grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* 1. Cinematic Loading Screen with Fixed Blackish Background & 7-Section Center Split Reveal */}
      {transitionStage !== 'completed' && (
        <LoadingScreen
          isExiting={transitionStage === 'revealing'}
          onUplinkComplete={handleUplinkComplete}
          isSoundMuted={isSoundMuted}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. Main Content Container */}
      <div
        className={`relative transition-opacity duration-700 ease-out ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        } ${
          transitionStage === 'completed' ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ transform: 'translateZ(0)' }}
      >
        {/* 1. Fixed Tactile Clay Navbar */}
        <Navbar
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isSoundMuted={isSoundMuted}
          onToggleSound={toggleSound}
        />

        {/* Main Content Flow */}
        <main>
          {/* 2. Full-Screen Hero Section */}
          <HeroSection
            isEntered={isContentVisible}
            onViewWork={() => scrollToSection('work')}
            onConnect={() => scrollToSection('contact')}
            onOpenResume={() => setIsResumeOpen(true)}
          />

          {/* 3. Typographic Transition Section */}
          <TransitionSection />

          {/* 4. About Section with Journey & Education Tabs */}
          <AboutSection
            onOpenResume={() => setIsResumeOpen(true)}
          />

          {/* 5. Selected Work Section with Category Filters */}
          <WorkSection projects={sampleProjects} />

          {/* 6. Skills Section */}
          <SkillsSection />

          {/* 7. Contact Section */}
          <ContactSection onShowToast={showToast} />
        </main>

        {/* 8. Minimal Clay Footer */}
        <Footer />
      </div>

      {/* Interactive Modals and Tools */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        onShowToast={showToast}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenResume={() => setIsResumeOpen(true)}
        onToggleSound={toggleSound}
        isSoundMuted={isSoundMuted}
        onShowToast={showToast}
      />

      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}


