import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChaloStore } from '../store';
import { useChalo } from '../hooks/use-chalo';
import { X, Send, Bot, CheckCircle2, ChevronLeft, ChevronRight, ListFilter, Type, RotateCcw, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Bubble as BubbleType, StepAction, ActionResult, Action } from '../types';
import { TargetHighlight } from './TargetHighlight';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: React.ReactNode;
}

// --- BUBBLE COMPONENTS ---

const MessageBubble = ({ content }: { content: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm w-fit max-w-[90%]">
    {content}
  </div>
);

const InputBubble = ({ targetField, value, onChange }: { targetField: string; value: unknown; onChange: (val: unknown) => void }) => (
  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 space-y-2 w-full max-w-[90%]">
    <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
      <Type size={12} />
      <span>Manual Entry: {targetField}</span>
    </div>
    <input
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-slate-900 dark:text-white"
      placeholder={`Type ${targetField}...`}
    />
  </div>
);

const SelectBubble = ({ targetField, value, options, onChange }: { targetField: string; value: unknown; options?: Array<{ label: string, value: unknown }>; onChange: (val: unknown) => void }) => (
  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 space-y-2 w-full max-w-[90%]">
    <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
      <ListFilter size={12} />
      <span>Select for: {targetField}</span>
    </div>
    <div className="relative">
      <select
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all appearance-none text-slate-900 dark:text-white"
      >
        <option value="" disabled>Select option...</option>
        {options?.map((opt, i) => (
          <option key={i} value={String(opt.value)}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
  </div>
);

const ActionGroupBubble = ({
  actions,
  onAction,
  onNext,
  onPrev
}: {
  actions: StepAction[];
  onAction: (a: StepAction) => void;
  onNext: () => void;
  onPrev: () => void;
}) => (
  <div className="flex flex-col items-end space-y-2 mt-2 w-full">
    {actions.map((action, idx) => (
      <button
        key={idx}
        onClick={() => {
          onAction(action);
          if (action.type === 'next') onNext();
          if (action.type === 'prev') onPrev();
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-5 rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center space-x-2"
      >
        <span>{action.label}</span>
        {action.type === 'next' && <ChevronRight size={16} />}
      </button>
    ))}
  </div>
);

const ActionStatusBubble = ({ action, result }: { action: Action; result: ActionResult }) => {
  const statusConfig = {
    running: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/30', label: 'Executing...' },
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800/30', label: 'Completed' },
    failed: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800/30', label: 'Failed' },
    cancelled: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/10', border: 'border-slate-200 dark:border-slate-700/30', label: 'Cancelled' },
    skipped: { icon: ChevronRight, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800/30', label: 'Skipped' },
    pending: { icon: Loader2, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/10', border: 'border-slate-200 dark:border-slate-700/30', label: 'Pending' },
  };
  const cfg = statusConfig[result.status];
  const Icon = cfg.icon;
  const actionLabel = action.label || action.type;

  return (
    <div className={cn("flex flex-col space-y-1 px-4 py-2.5 rounded-xl border text-sm", cfg.bg, cfg.border)}>
      <div className="flex items-center space-x-3">
        <Icon size={16} className={cn(cfg.color, result.status === 'running' && 'animate-spin')} />
        <span className={cn("font-medium", cfg.color)}>{actionLabel}</span>
      </div>
      <div className="flex items-center space-x-2 ml-7">
        <span className="text-xs text-slate-400">{cfg.label}</span>
        {result.error && <span className="text-xs text-rose-400">· {result.error}</span>}
        {result.attempts > 1 && <span className="text-xs text-slate-400">· ({result.attempts} attempts)</span>}
      </div>
    </div>
  );
};

const BubbleRenderer = ({
  bubble,
  fieldValues,
  onFill,
  onNext,
  onPrev,
  onInteraction
}: {
  bubble: BubbleType;
  fieldValues: Record<string, unknown>;
  onFill: (f: string, v: unknown) => void;
  onNext: () => void;
  onPrev: () => void;
  onInteraction: (text: string) => void;
}) => {
  switch (bubble.type) {
    case 'message':
      return <MessageBubble content={bubble.content} />;
    case 'input':
      return (
        <InputBubble
          targetField={bubble.targetField!}
          value={fieldValues[bubble.targetField!]}
          onChange={(v) => {
            onFill(bubble.targetField!, v);
          }}
        />
      );
    case 'select':
      return (
        <SelectBubble
          targetField={bubble.targetField!}
          options={bubble.options}
          value={fieldValues[bubble.targetField!]}
          onChange={(v) => {
            onFill(bubble.targetField!, v);
          }}
        />
      );
    case 'action-group':
      return (
        <ActionGroupBubble
          actions={bubble.actions || []}
          onNext={onNext}
          onPrev={onPrev}
          onAction={(a) => {
            if (a.type === 'fill_field' && a.data) {
              const d = a.data as { field: string; value: unknown };
              onFill(d.field, d.value);
              onInteraction(`Auto-filled ${d.field} with ${d.value}`);
            } else if (a.type === 'click' && a.data) {
              const d = a.data as { selector: string };
              const el = document.querySelector(d.selector);
              if (el) { (el as HTMLElement).click(); onInteraction(`Clicked: ${d.selector}`); }
            } else if (a.onClick) {
              a.onClick();
              onInteraction(`Performed action: ${a.label}`);
            } else {
              onInteraction(`Clicked: ${a.label}`);
            }
          }}
        />
      );
    default:
      return null;
  }
};

// --- MAIN DRAWER COMPONENT ---

export function SmartDrawer({ className }: { className?: string }) {
  const store = useChaloStore();
  const { activeMission, currentStep, nextStep, prevStep, fillField, fieldErrors, fieldValues, executionContext, cancelExecution } = useChalo({ debug: import.meta.env.DEV });
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [displayedStepId, setDisplayedStepId] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(!!store.activeMissionId && !store.isPaused);
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
    const currentIndex = activeMission.steps.findIndex(s => s.id === displayedStepId);
    if (currentIndex === -1) return messages;

    const visibleSteps = activeMission.steps.slice(0, currentIndex + 1);

    visibleSteps.forEach(step => {
      messages.push({
        id: `sys-${step.id}`,
        role: 'system',
        content: step.content
      });

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

  if (!activeMission || !currentStep) {
    // Show resume prompt if there's an incomplete tour and no active mission
    const incompleteTour = Object.values(store.tourHistory).find(
      (t) => !t.completed && t.lastAccessed > Date.now() - 7 * 24 * 60 * 60 * 1000 // within 7 days
    );
    if (incompleteTour) {
      const mission = store.missions[incompleteTour.missionId];
      if (mission) {
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-screen w-[400px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col shrink-0 z-[60]"
          >
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-amber-500/10 rounded-2xl">
                <RotateCcw size={32} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resume Tour?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You were taking the <strong>{mission.title}</strong> tour. Would you like to continue where you left off?
              </p>
              <div className="flex flex-col w-full space-y-2 pt-2">
                <button
                  onClick={() => {
                    store.startMission(incompleteTour.missionId);
                    if (incompleteTour.lastStepId) {
                      store.goToStep(incompleteTour.lastStepId);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Resume Tour</span>
                </button>
                <button
                  onClick={() => store.recordTourEntry(incompleteTour.missionId, incompleteTour.lastStepId, true)}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        );
      }
    }
    return null;
  }


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'h-screen overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col shrink-0 z-[60]',
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
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">Chalo Guide</h2>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{activeMission.title}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors shrink-0" onClick={() => {
                store.dismissAllTours();
                store.resetMission();
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth min-h-0">
              <AnimatePresence initial={false}>
                {chatHistory.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
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

                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-start w-full">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 px-5 shadow-sm flex items-center space-x-1">
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Render explicitly defined bubbles if present */}
                  {currentStep.bubbles?.map((bubble) => (
                    <div key={bubble.id} className={cn("flex w-full", bubble.type === 'action-group' ? "justify-end" : "justify-start")}>
                      <BubbleRenderer
                        bubble={bubble}
                        fieldValues={fieldValues || {}}
                        onFill={fillField}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onInteraction={(text) => store.addInteraction(currentStep.id, text)}
                      />
                    </div>
                  ))}

                  {/* Fallback to legacy action buttons if bubbles not defined */}
                  {!currentStep.bubbles && currentStep.actions && currentStep.actions.length > 0 && (
                    <ActionGroupBubble
                      actions={currentStep.actions}
                      onNext={nextStep}
                      onPrev={prevStep}
                      onAction={(a) => {
                        if (a.type === 'fill_field' && a.data) {
                          const d = a.data as { field: string; value: unknown };
                          fillField(d.field, d.value);
                          store.addInteraction(currentStep.id, `Used auto-fill: ${d.value}`);
                        } else if (a.type === 'click' && a.data) {
                          const d = a.data as { selector: string };
                          const el = document.querySelector(d.selector);
                          if (el) { (el as HTMLElement).click(); store.addInteraction(currentStep.id, `Clicked: ${d.selector}`); }
                        } else if (a.onClick) {
                          a.onClick();
                          store.addInteraction(currentStep.id, `Selected: ${a.label}`);
                        }
                      }}
                    />
                  )}

                  {/* Action execution status */}
                  {currentStep?.actionSequence && Object.keys(executionContext.results).length > 0 && (
                    <div className="space-y-2">
                      {currentStep.actionSequence.map((action) => {
                        const result = executionContext.results[action.id];
                        if (!result) return null;
                        return (
                          <div key={action.id} className="flex justify-start w-full">
                            <ActionStatusBubble action={action} result={result} />
                          </div>
                        );
                      })}
                      {executionContext.isRunning && (
                        <button
                          onClick={cancelExecution}
                          className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 font-medium ml-2 mt-1"
                        >
                          <XCircle size={12} />
                          <span>Cancel execution</span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
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
                    if (currentStep.targetField) {
                      const val = fieldValues[currentStep.targetField];
                      store.addInteraction(currentStep.id, `Confirmed value: ${val}`);
                    } else if (!store.interactionHistory.find(i => i.stepId === currentStep.id)) {
                      store.addInteraction(currentStep.id, "Proceeded to next step");
                    }
                    nextStep();
                  }}
                  disabled={(currentStep.targetField && !!(fieldErrors as Record<string, unknown>)?.[currentStep.targetField]) || activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1}
                  className={cn("p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50")}
                >
                  {activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1 ? <CheckCircle2 size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Target element highlight overlay */}
      {currentStep?.targetElement && (
        <TargetHighlight
          selector={currentStep.targetElement}
          label={currentStep.title}
        />
      )}
    </>
  );
}
