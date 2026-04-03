import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChaloStore } from '../store';
import { useChalo } from '../hooks/use-chalo';
import { X, Send, Bot, CheckCircle2, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: React.ReactNode;
}

export function SmartDrawer({ className }: { className?: string }) {
  const store = useChaloStore();
  const { activeMission, currentStep, nextStep, prevStep, fillField, fieldErrors } = useChalo();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track which step we are currently focusing on typing
  const [displayedStepId, setDisplayedStepId] = useState<string | null>(null);

  useEffect(() => {
    if (store.activeMissionId && !store.isPaused) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [store.activeMissionId, store.isPaused]);

  // Handle typing indicator delay
  useEffect(() => {
    if (currentStep && currentStep.id !== displayedStepId) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setDisplayedStepId(currentStep.id);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentStep, displayedStepId]);

  // Generate Chat History
  const chatHistory = useMemo(() => {
    if (!activeMission) return [];
    const messages: ChatMessage[] = [];
    
    // We only show steps up to the currently displayed one
    const currentIndex = activeMission.steps.findIndex(s => s.id === displayedStepId);
    if (currentIndex === -1) return messages;

    const visibleSteps = activeMission.steps.slice(0, currentIndex + 1);

    visibleSteps.forEach(step => {
      // 1. System message
      messages.push({
        id: `sys-${step.id}`,
        role: 'system',
        content: step.content
      });

      // 2. See if there was a user interaction recorded in store
      const interaction = store.interactionHistory.find(i => i.stepId === step.id);
      if (interaction) {
        messages.push({
          id: `usr-${step.id}`,
          role: 'user',
          content: interaction.actionText
        });
      }
    });

    return messages;
  }, [activeMission, displayedStepId, store.interactionHistory]);

  // Auto-scroll Down
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  if (!activeMission || !currentStep) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'h-screen overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col shrink-0',
            className
          )}
        >
          {/* Chat Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="relative shrink-0">
                  <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                    <Bot size={20} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  Chalo Guide
                </h2>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {activeMission.title}
                </p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors shrink-0"
              onClick={() => store.pauseMission()}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth min-h-0"
          >
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, originY: 1 }}
                  className="flex justify-start w-full"
                >
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 px-5 shadow-sm flex items-center space-x-1">
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                    </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Target Field Info Block */}
            {!isTyping && currentStep.targetField && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="w-full flex justify-center py-2"
                >
                  <div className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 size={14} />
                    <span>Waiting for input: {currentStep.targetField}</span>
                  </div>
                </motion.div>
            )}

            {/* Actions / Interactive Bubbles */}
            {!isTyping && currentStep.actions && currentStep.actions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-end space-y-2 mt-4"
                >
                  {currentStep.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (action.type === 'fill_field' && action.data) {
                          const dataOpt = action.data as { field: string; value: unknown };
                          fillField(dataOpt.field, dataOpt.value);
                          store.addInteraction(currentStep.id, `Used auto-fill for: ${dataOpt.value}`);
                        } else if (action.onClick) {
                          action.onClick();
                          store.addInteraction(currentStep.id, `Selected: ${action.label}`);
                        } else {
                          store.addInteraction(currentStep.id, `Selected: ${action.label}`);
                        }
                        if (action.type === 'next') nextStep();
                        if (action.type === 'prev') prevStep();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-2xl rounded-tr-sm shadow-md transition-all active:scale-95"
                    >
                      {action.label}
                    </button>
                  ))}
                </motion.div>
            )}
          </div>

          {/* Footer / Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between space-x-2">
                <button
                  onClick={() => {
                    store.addInteraction(currentStep.id, "Navigated backwards");
                    prevStep();
                  }}
                  disabled={activeMission.steps.indexOf(currentStep) === 0}
                  className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center overflow-hidden">
                    <span className="text-sm text-slate-400 flex-1 truncate">
                      {currentStep.targetField ? `Focusing on ${currentStep.targetField}...` : "Reading..."}
                    </span>
                </div>

                <button
                  onClick={() => {
                    store.addInteraction(currentStep.id, "Proceeded to next step");
                    nextStep();
                  }}
                  disabled={
                    (currentStep.targetField && (fieldErrors as Record<string, unknown>)?.[currentStep.targetField] !== undefined) ||
                    activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1
                  }
                  className={cn(
                    "p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-50",
                    currentStep.targetField && ((fieldErrors as Record<string, unknown>)?.[currentStep.targetField] !== undefined) && "bg-rose-500 hover:bg-rose-600 hover:animate-shake cursor-not-allowed"
                  )}
                >
                    {activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1 ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Send size={20} className="mr-0.5" />
                    )}
                </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
