import React from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinancial();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl"
          >
            <div className="mt-0.5">
              {toast.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
              {toast.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100 font-sans tracking-wide">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
