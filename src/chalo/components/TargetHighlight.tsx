import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TargetHighlightProps {
  selector: string;
  label?: string;
  pulse?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TargetHighlight({ selector, label, pulse = true }: TargetHighlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateRect = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
      rafRef.current = requestAnimationFrame(updateRect);
    };

    rafRef.current = requestAnimationFrame(updateRect);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [selector]);

  if (!rect) return null;

  const padding = 8;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed pointer-events-none z-[9999]"
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-indigo-500"
          animate={pulse ? { boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {label && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg">
            {label}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
