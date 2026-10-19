import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121217]/95 border border-white/12 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white font-sans text-xs sm:text-sm pointer-events-auto select-none"
        >
          <span className="w-5 h-5 rounded-full bg-[#df5035]/20 text-[#df5035] flex items-center justify-center shrink-0">
            <Check size={12} />
          </span>
          <span className="font-medium pr-2">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
