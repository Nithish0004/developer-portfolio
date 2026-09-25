import React, { useState } from 'react';
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

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f5f1eb] text-[#1f1c19] selection:bg-[#df6b55] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Subtle organic texture overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* Initial cinematic loading screen with ThreeUI UplinkLoader, Lightning, & Star Portal */}
      <LoadingScreen onLoadingComplete={() => setIsLoaded(true)} />

      {/* Main Content Container with soft rising clay reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 24,
          filter: isLoaded ? 'blur(0px)' : 'blur(4px)',
        }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* 1. Fixed Tactile Clay Navbar */}
        <Navbar />

        {/* Main Content Flow */}
        <main>
          {/* 2. Full-Screen Hero Section */}
          <HeroSection
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
      </motion.div>
    </div>
  );
}

