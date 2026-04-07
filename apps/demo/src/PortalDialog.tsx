import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PortalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * A dialog that renders in a portal (at the end of document.body).
 * This simulates real-world dialog libraries like Radix UI, Headless UI, etc.
 *
 * Note: The high z-index (z-[9999]) is intentional to simulate the problem
 * that occurs when third-party dialog libraries use very high z-index values.
 */
export function PortalDialog({ isOpen, onClose, title, children }: PortalDialogProps) {
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create portal root when component mounts
    const portalRoot = document.createElement('div');
    portalRoot.id = 'portal-dialog-root';
    document.body.appendChild(portalRoot);
    portalRootRef.current = portalRoot;

    return () => {
      // Clean up portal root when component unmounts
      if (portalRootRef.current && portalRootRef.current.parentNode) {
        portalRootRef.current.parentNode.removeChild(portalRootRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !portalRootRef.current) return null;

  return createPortal(
    <AnimatePresence>
      <>
        {/* Backdrop - very high z-index to ensure it's on top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9998"
        />

        {/* Dialog container - extremely high z-index (common in third-party libraries) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-md mx-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    portalRootRef.current
  );
}
