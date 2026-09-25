import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Github, Linkedin, ArrowUpRight, Copy, Check, Send } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 md:py-40 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full border-t border-[#e5ded4]">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-[#e5ded4]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-[#c4543f] font-bold">04</span>
          <span className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">/ CONNECT</span>
        </div>
        <div className="text-xs font-mono tracking-widest text-[#7a7269] uppercase font-medium">
          DIRECT LINE
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 sm:pt-16">
        {/* Left Column: Direct Communication Channels */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-10">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.88] text-[#1f1c19] uppercase select-none"
            >
              GET IN TOUCH
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base sm:text-lg text-[#5e5852] font-sans leading-relaxed max-w-xl text-balance"
            >
              Whether you want to collaborate on a systems project, explore an internship opportunity, or talk about engineering architecture, my inbox is open.
            </motion.p>
          </div>

          {/* Direct Email Display in Tactile Clay Well */}
          <div className="clay-surface p-6 sm:p-7 space-y-3">
            <span className="text-xs font-mono text-[#8a8175] uppercase tracking-widest block font-semibold">
              PRIMARY EMAIL
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${personalInfo.contact.email}`}
                className="font-display font-bold text-lg sm:text-xl md:text-2xl text-[#1f1c19] hover:text-[#c4543f] transition-colors"
              >
                {personalInfo.contact.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="clay-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono tracking-widest text-[#5e5852] hover:text-[#1f1c19] uppercase cursor-pointer font-semibold"
                aria-label="Copy email address"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-[#c4543f]" />
                    <span className="text-[#c4543f]">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono text-[#8a8175] uppercase tracking-widest block font-semibold">
              EXTERNAL NETWORKS
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs tracking-widest">
              <a
                href={personalInfo.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn inline-flex items-center gap-2 text-[#5e5852] hover:text-[#1f1c19] px-4 py-2.5 font-semibold transition-all cursor-pointer"
              >
                <Github size={15} />
                <span>GITHUB</span>
                <ArrowUpRight size={12} className="text-[#8a8175]" />
              </a>

              <a
                href={personalInfo.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn inline-flex items-center gap-2 text-[#5e5852] hover:text-[#1f1c19] px-4 py-2.5 font-semibold transition-all cursor-pointer"
              >
                <Linkedin size={15} />
                <span>LINKEDIN</span>
                <ArrowUpRight size={12} className="text-[#8a8175]" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Tactile Clay Contact CTA Form */}
        <div className="lg:col-span-5">
          <div className="clay-card p-6 sm:p-8 md:p-10">
            <div className="pb-6 border-b border-[#ede7de] mb-6">
              <h3 className="font-display font-bold text-xl text-[#1f1c19] tracking-tight">
                SEND A MESSAGE
              </h3>
              <p className="text-xs font-mono text-[#8a8175] tracking-wider uppercase pt-1 font-semibold">
                INQUIRIES · COLLABORATION · OPPORTUNITIES
              </p>
            </div>

            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl clay-inset text-[#c4543f] flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="font-display font-bold text-lg text-[#1f1c19]">
                  Message Dispatched
                </h4>
                <p className="text-sm font-sans text-[#5e5852] max-w-xs mx-auto">
                  Thank you for reaching out. I will review your note and reply to{' '}
                  <span className="text-[#1f1c19] font-mono font-semibold">{formState.email}</span> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormState({ name: '', email: '', message: '' });
                  }}
                  className="clay-btn mt-4 text-xs font-mono tracking-widest text-[#c4543f] uppercase px-4 py-2 font-semibold cursor-pointer"
                >
                  SEND ANOTHER NOTE
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-[#7a7269] uppercase tracking-wider pb-2 font-semibold">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                    placeholder="e.g. Alex Vance"
                    className="clay-inset w-full px-4 py-3 text-sm text-[#1f1c19] placeholder:text-[#a39a8f] focus:outline-none focus:ring-2 focus:ring-[#c4543f]/40 transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-[#7a7269] uppercase tracking-wider pb-2 font-semibold">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    required
                    placeholder="name@organization.com"
                    className="clay-inset w-full px-4 py-3 text-sm text-[#1f1c19] placeholder:text-[#a39a8f] focus:outline-none focus:ring-2 focus:ring-[#c4543f]/40 transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-[#7a7269] uppercase tracking-wider pb-2 font-semibold">
                    PROJECT / MESSAGE
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    required
                    placeholder="Tell me about what you're building or exploring..."
                    className="clay-inset w-full px-4 py-3 text-sm text-[#1f1c19] placeholder:text-[#a39a8f] focus:outline-none focus:ring-2 focus:ring-[#c4543f]/40 transition-all resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="clay-btn-accent w-full flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer"
                >
                  <span>DISPATCH MESSAGE</span>
                  <Send size={13} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
