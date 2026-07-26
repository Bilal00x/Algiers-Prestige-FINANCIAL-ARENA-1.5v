// src/components/ui/BackgroundOverlay.tsx
import React from "react";
import { motion } from "framer-motion";

// A subtle animated gradient background using Framer Motion
export const BackgroundOverlay: React.FC = () => (
  <motion.div
    className="fixed inset-0 -z-10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.2 }}
  >
    {/* Animated floating circles */}
    <motion.div
      className="absolute rounded-full bg-emerald-500 opacity-10 filter blur-3xl"
      style={{ width: 300, height: 300, top: "20%", left: "15%" }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute rounded-full bg-rose-500 opacity-10 filter blur-3xl"
      style={{ width: 250, height: 250, bottom: "15%", right: "10%" }}
      animate={{ scale: [1, 1.25, 1] }}
      transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
    />
  </motion.div>
);
