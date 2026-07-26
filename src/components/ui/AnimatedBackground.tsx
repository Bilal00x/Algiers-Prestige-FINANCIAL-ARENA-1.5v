// src/components/ui/AnimatedBackground.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Simple animated floating circles using Framer Motion
export const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
    {/* Emerald pulse */}
    <motion.div
      className="absolute rounded-full bg-emerald-500 opacity-10 filter blur-3xl"
      style={{ width: 300, height: 300, top: '15%', left: '20%' }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
    />
    {/* Rose pulse */}
    <motion.div
      className="absolute rounded-full bg-rose-500 opacity-10 filter blur-3xl"
      style={{ width: 250, height: 250, bottom: '10%', right: '15%' }}
      animate={{ scale: [1, 1.25, 1] }}
      transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
    />
    {/* Subtle rotate line */}
    <motion.div
      className="absolute w-1 h-64 bg-emerald-600 opacity-5"
      style={{ top: '30%', left: '50%' }}
      animate={{ rotate: [0, 360] }}
      transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
    />
  </div>
);
