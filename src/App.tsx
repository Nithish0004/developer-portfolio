import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TransitionSection } from './components/TransitionSection';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { sampleProjects } from './data/portfolioData';
import { mountParticleScroll } from './utils/particleScroll';

export default function App() {
  const [transitionStage, setTransitionStage] = useState<'loading' | 'revealing' | 'completed'>('loading');
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Initialize ThreeUI ParticleScroll on content elements below Hero
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
        tintA: [0.77, 0.33, 0.25], // Terracotta (#c4543f)
        tintB: [0.93, 0.54, 0.42], // Coral-orange (#df6b55)
        bg: [0.96, 0.945, 0.92],   // Warm cream (#f5f1eb)
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
    <div className="relative min-h-screen w-full bg-[#f5f1eb] text-[#1f1c19] selection:bg-[#df6b55] selection:text-white font-sans antialiased">
      {/* 1. Cinematic Loading Screen with Fixed Blackish Background & 7-Section Center Split Reveal */}
      {transitionStage !== 'completed' && (
        <LoadingScreen
          isExiting={transitionStage === 'revealing'}
          onUplinkComplete={handleUplinkComplete}
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
        <Navbar />

        {/* Main Content Flow */}
        <main>
          {/* 2. Full-Screen Hero Section */}
          <HeroSection
            isEntered={isContentVisible}
            onViewWork={() => scrollToSection('work')}
            onConnect={() => scrollToSection('contact')}
          />

          {/* 3. Typographic Transition Section */}
          <TransitionSection />

          {/* 4. About Section */}
          <AboutSection />

          {/* 5. Selected Work Section */}
          <WorkSection projects={sampleProjects} />

          {/* 6. Skills Section */}
          <SkillsSection />

          {/* 7. Contact Section */}
          <ContactSection />
        </main>

        {/* 8. Minimal Clay Footer */}
        <Footer />
      </div>
    </div>
  );
}

