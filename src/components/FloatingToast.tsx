import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface CheckResultData {
  status: 'success' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface FloatingToastProps {
  result: CheckResultData | null;
  onClose: () => void;
}

export const FloatingToast: React.FC<FloatingToastProps> = ({ result, onClose }) => {
  // Auto dismiss success toast after 5s
  useEffect(() => {
    if (!result) return;
    if (result.status === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  if (!result) return null;

  const config = {
    success: {
      bg: 'bg-emerald-600/95 border-emerald-400 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />,
      btn: 'hover:bg-emerald-700',
    },
    warning: {
      bg: 'bg-amber-600/95 border-amber-400 text-white',
      icon: <AlertTriangle className="w-5 h-5 text-amber-100 shrink-0" />,
      btn: 'hover:bg-amber-700',
    },
    info: {
      bg: 'bg-sky-600/95 border-sky-400 text-white',
      icon: <Info className="w-5 h-5 text-sky-100 shrink-0" />,
      btn: 'hover:bg-sky-700',
    },
  }[result.status];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-14 sm:top-20 inset-x-3 sm:inset-x-0 mx-auto max-w-md sm:max-w-lg z-50 pointer-events-auto shadow-2xl"
      >
        <div
          className={`flex items-start justify-between gap-3 p-3 sm:p-4 rounded-2xl border backdrop-blur-md ${config.bg}`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            {config.icon}
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold leading-snug">{result.message}</p>
              {result.details && (
                <p className="text-[11px] sm:text-xs text-white/90 leading-relaxed font-normal">
                  {result.details}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg text-white/80 hover:text-white ${config.btn} transition-colors shrink-0 cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
