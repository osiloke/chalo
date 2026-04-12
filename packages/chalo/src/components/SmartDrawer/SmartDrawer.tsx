import { createContext, useContext, useEffect, useRef, useCallback, memo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, ChevronLeft, ChevronRight, ListFilter, Type, RotateCcw, Loader2, AlertCircle, XCircle, Compass } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSmartDrawer, type SmartDrawerState } from '../../hooks/use-smart-drawer';
import { Bubble as BubbleType, StepAction, ActionResult, Action } from '../../types';
import { TargetHighlight } from '../TargetHighlight';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONTEXT ---

interface SmartDrawerContextValue extends SmartDrawerState {
  /** Internal context marker */
  __drawer: true;
}

const SmartDrawerContext = createContext<SmartDrawerContextValue | null>(null);

function useSmartDrawerContext() {
  const ctx = useContext(SmartDrawerContext);
  if (!ctx) {
    throw new Error('SmartDrawer compound components must be used within <SmartDrawer.Root>');
  }
  return ctx;
}

// --- ACTION STATUS CONFIG ---

const ACTION_STATUS_CONFIG = {
  running: { icon: Loader2, color: 'text-chalo-info', bg: 'bg-chalo-info-light', border: 'border-chalo-info-border', label: 'Executing...' },
  success: { icon: CheckCircle2, color: 'text-chalo-success', bg: 'bg-chalo-success-light', border: 'border-chalo-success-border', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-chalo-error', bg: 'bg-chalo-error-light', border: 'border-chalo-error-border', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-chalo-text-muted', bg: 'bg-chalo-surface-subtle', border: 'border-chalo-border', label: 'Cancelled' },
  skipped: { icon: ChevronRight, color: 'text-chalo-warning', bg: 'bg-chalo-warning-light', border: 'border-chalo-warning-border', label: 'Skipped' },
  pending: { icon: Loader2, color: 'text-chalo-text-muted', bg: 'bg-chalo-surface-subtle', border: 'border-chalo-border', label: 'Pending' },
} as const;

// --- BUBBLE COMPONENTS (Memoized) ---

const MessageBubble = memo(({ content }: { content: React.ReactNode }) => (
  <div className="bg-chalo-surface text-chalo-text-secondary border border-chalo-border-subtle rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm w-fit max-w-[90%]">
    {content}
  </div>
));
MessageBubble.displayName = 'MessageBubble';

const InputBubble = memo(({ targetField, value, onChange }: { targetField: string; value: unknown; onChange: (val: unknown) => void }) => (
  <div className="bg-chalo-primary-light border border-chalo-primary-border rounded-2xl p-4 space-y-2 w-full max-w-[90%]">
    <div className="flex items-center space-x-2 text-[10px] font-bold text-chalo-primary uppercase tracking-widest">
      <Type size={12} />
      <span>Manual Entry: {targetField}</span>
    </div>
    <input
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-chalo-surface border border-chalo-border text-chalo-text rounded-xl px-4 py-2.5 text-sm outline-none shadow-sm transition-all focus:ring-2 focus:ring-chalo-primary"
      placeholder={`Type ${targetField}...`}
    />
  </div>
));
InputBubble.displayName = 'InputBubble';

const SelectBubble = memo(({ targetField, value, options, onChange }: { targetField: string; value: unknown; options?: Array<{ label: string, value: unknown }>; onChange: (val: unknown) => void }) => (
  <div className="bg-chalo-primary-light border border-chalo-primary-border rounded-2xl p-4 space-y-2 w-full max-w-[90%]">
    <div className="flex items-center space-x-2 text-[10px] font-bold text-chalo-primary uppercase tracking-widest">
      <ListFilter size={12} />
      <span>Select for: {targetField}</span>
    </div>
    <div className="relative">
      <select
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-chalo-surface border border-chalo-border text-chalo-text rounded-xl px-4 py-2.5 text-sm outline-none shadow-sm transition-all appearance-none focus:ring-2 focus:ring-chalo-primary"
      >
        <option value="" disabled>Select option...</option>
        {options?.map((opt, i) => (
          <option key={i} value={String(opt.value)}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-chalo-text-muted">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
  </div>
));
SelectBubble.displayName = 'SelectBubble';

const ActionGroupBubble = memo(({
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
        className="bg-chalo-primary hover:bg-chalo-primary-hover text-white text-sm font-semibold py-2.5 px-5 rounded-2xl rounded-tr-sm shadow-lg transition-all active:scale-95 flex items-center space-x-2"
      >
        <span>{action.label}</span>
        {action.type === 'next' && <ChevronRight size={16} />}
      </button>
    ))}
  </div>
));
ActionGroupBubble.displayName = 'ActionGroupBubble';

const ActionStatusBubble = memo(({ action, result }: { action: Action; result: ActionResult }) => {
  const cfg = ACTION_STATUS_CONFIG[result.status];
  const Icon = cfg.icon;
  const actionLabel = action.label || action.type;

  return (
    <div className={cn("flex flex-col space-y-1 px-4 py-2.5 rounded-xl border text-sm", cfg.bg, cfg.border)}>
      <div className="flex items-center space-x-3">
        <Icon size={16} className={cn(cfg.color, result.status === 'running' && 'animate-spin')} />
        <span className={cn("font-medium", cfg.color)}>{actionLabel}</span>
      </div>
      <div className="flex items-center space-x-2 ml-7">
        <span className="text-xs text-chalo-text-muted">{cfg.label}</span>
        {result.error && <span className="text-xs text-chalo-error">· {result.error}</span>}
        {result.attempts > 1 && <span className="text-xs text-chalo-text-muted">· ({result.attempts} attempts)</span>}
      </div>
    </div>
  );
});
ActionStatusBubble.displayName = 'ActionStatusBubble';

const BubbleRenderer = memo(({
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
  const handleAction = useCallback((a: StepAction) => {
    if (a.type === 'fill_field' && a.data) {
      const d = a.data as { field: string; value: unknown };
      onFill(d.field, d.value);
      onInteraction(`Auto-filled ${d.field} with ${d.value}`);
    } else if (a.type === 'click' && a.data) {
      const d = a.data as { selector?: string; field?: string };
      const targetSelector = d.field 
        ? `[data-chalo-field="${d.field}"], #chalo-${d.field}` 
        : d.selector;
      
      if (targetSelector) {
        const el = document.querySelector(targetSelector);
        if (el) { 
          (el as HTMLElement).click(); 
          onInteraction(`Clicked: ${targetSelector}`); 
        }
      }
    } else if (a.onClick) {
      a.onClick();
      onInteraction(`Performed action: ${a.label}`);
    } else {
      onInteraction(`Clicked: ${a.label}`);
    }
  }, [onFill, onInteraction]);

  const handleInputChange = useCallback((v: unknown) => {
    onFill(bubble.targetField!, v);
  }, [bubble.targetField, onFill]);

  const handleSelectChange = useCallback((v: unknown) => {
    onFill(bubble.targetField!, v);
  }, [bubble.targetField, onFill]);

  switch (bubble.type) {
    case 'message':
      return <MessageBubble content={bubble.content} />;
    case 'input':
      if (!bubble.targetField) return null;
      return (
        <InputBubble
          targetField={bubble.targetField}
          value={fieldValues[bubble.targetField]}
          onChange={handleInputChange}
        />
      );
    case 'select':
      if (!bubble.targetField) return null;
      return (
        <SelectBubble
          targetField={bubble.targetField}
          options={bubble.options}
          value={fieldValues[bubble.targetField]}
          onChange={handleSelectChange}
        />
      );
    case 'action-group':
      return (
        <ActionGroupBubble
          actions={bubble.actions || []}
          onNext={onNext}
          onPrev={onPrev}
          onAction={handleAction}
        />
      );
    default:
      return null;
  }
});
BubbleRenderer.displayName = 'BubbleRenderer';

const TypingIndicator = memo(() => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'chalo-typing-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-3px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="bg-chalo-surface border border-chalo-border-subtle rounded-2xl rounded-tl-sm p-4 px-5 shadow-sm flex items-center space-x-1">
      <div className="w-1.5 h-1.5 bg-chalo-text-muted rounded-full" style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-chalo-text-muted rounded-full" style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '200ms' }} />
      <div className="w-1.5 h-1.5 bg-chalo-text-muted rounded-full" style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '400ms' }} />
    </div>
  );
});
TypingIndicator.displayName = 'TypingIndicator';

// =============================
// COMPOUND COMPONENTS
// =============================

// --- ROOT ---

export interface SmartDrawerRootProps {
  children: ReactNode;
  /** Custom className for the drawer panel */
  className?: string;
  /** Custom className for the placeholder (pushes content in flex layout) */
  placeholderClassName?: string;
}

export function SmartDrawerRoot({
  children,
  className,
  placeholderClassName,
}: SmartDrawerRootProps) {
  const drawerState = useSmartDrawer();

  return (
    <>
      {/* Placeholder: stays in flex flow to push content */}
      <AnimatePresence>
        {drawerState.isOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 400 }}
            exit={{ width: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn('h-screen w-100 shrink-0', placeholderClassName)}
            data-chalo-drawer-placeholder="true"
          />
        )}
      </AnimatePresence>

      {/* Actual drawer: fixed with high z-index to escape stacking contexts */}
      <SmartDrawerContext.Provider value={{ ...drawerState, __drawer: true }}>
        <AnimatePresence>
          {drawerState.isOpen && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed top-0 right-0 h-screen w-100 overflow-hidden bg-chalo-surface/95 backdrop-blur-xl border-l border-chalo-border shadow-2xl flex flex-col z-10000',
                className
              )}
              data-chalo-drawer="true"
            >
              {children}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Target element highlight overlay */}
        {drawerState.currentStep?.targetElement && (
          <TargetHighlight
            selector={drawerState.currentStep.targetElement}
            label={drawerState.currentStep.title}
          />
        )}
      </SmartDrawerContext.Provider>
    </>
  );
}

// --- HEADER ---

export interface SmartDrawerHeaderProps {
  /** Override mission title (sub-header) */
  title?: string;
  /** Main header title (e.g. "Chalo Guide") */
  headerTitle?: string;
  /** Custom icon for the header */
  icon?: React.ElementType;
  /** Custom className */
  className?: string;
  /** Custom dismiss handler */
  onDismiss?: () => void;
}

export function SmartDrawerHeader({
  title,
  headerTitle = "Chalo Guide",
  icon: Icon = Compass,
  className,
  onDismiss
}: SmartDrawerHeaderProps) {
  const { activeMission, dismiss } = useSmartDrawerContext();
  const handleDismiss = onDismiss || dismiss;

  return (
    <div className={cn("p-5 border-b border-chalo-border flex items-center justify-between bg-chalo-surface-subtle/50 backdrop-blur-sm z-10 shrink-0", className)}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="relative shrink-0">
          <div className="p-2 bg-chalo-primary rounded-xl text-white shadow-lg shadow-chalo-primary/30">
            <Icon size={20} />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-chalo-success border-2 border-chalo-surface rounded-full" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-chalo-text leading-tight truncate">{headerTitle}</h2>
          <p className="text-[11px] font-semibold text-chalo-text-secondary truncate">
            {title || activeMission?.title}
          </p>
        </div>
      </div>
      <button
        className="p-2 hover:bg-chalo-surface-muted rounded-lg text-chalo-text-secondary transition-colors shrink-0"
        onClick={handleDismiss}
      >
        <X size={18} />
      </button>
    </div>
  );
}

// --- BODY ---

export interface SmartDrawerBodyProps {
  /** Custom className for scroll container */
  className?: string;
  /** Custom bubble renderer (overrides default) */
  renderBubble?: (bubble: BubbleType) => ReactNode;
  /** Custom empty state when no messages */
  emptyState?: ReactNode;
}

export function SmartDrawerBody({ className, renderBubble, emptyState }: SmartDrawerBodyProps) {
  const { chatHistory, isTyping, currentStep, fieldValues, executionContext, actions } = useSmartDrawerContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [chatHistory, isTyping]);

  const renderDefaultBubble = useCallback((bubble: BubbleType) => (
    <BubbleRenderer
      bubble={bubble}
      fieldValues={fieldValues || {}}
      onFill={actions.fillField}
      onNext={actions.nextStep}
      onPrev={actions.prevStep}
      onInteraction={actions.handleBubbleInteraction}
    />
  ), [fieldValues, actions]);

  const bubbleRenderer = renderBubble || renderDefaultBubble;

  return (
    <div ref={scrollRef} className={cn("flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth min-h-0", className)}>
      <AnimatePresence initial={false}>
        {chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            <div className={cn(
              "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm will-change-transform",
              msg.role === 'user'
                ? "bg-chalo-text text-chalo-text-inverse rounded-tr-sm"
                : "bg-chalo-surface text-chalo-text-secondary border border-chalo-border-subtle rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-start w-full"
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {!isTyping && currentStep && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Render explicitly defined bubbles if present */}
          {currentStep.bubbles?.map((bubble) => (
            <div key={bubble.id} className={cn("flex w-full", bubble.type === 'action-group' ? "justify-end" : "justify-start")}>
              {bubbleRenderer(bubble)}
            </div>
          ))}

          {/* Fallback to legacy action buttons if bubbles not defined */}
          {!currentStep.bubbles && currentStep.actions && currentStep.actions.length > 0 && (
            <ActionGroupBubble
              actions={currentStep.actions}
              onNext={actions.nextStep}
              onPrev={actions.prevStep}
              onAction={actions.handleLegacyAction}
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
                  onClick={actions.cancelExecution}
                  className="flex items-center space-x-1 text-xs text-chalo-error hover:text-chalo-error/80 font-medium ml-2 mt-1"
                >
                  <XCircle size={12} />
                  <span>Cancel execution</span>
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {!currentStep.bubbles && !currentStep.actions && (!currentStep.actionSequence || Object.keys(executionContext.results).length === 0) && emptyState}
        </motion.div>
      )}
    </div>
  );
}

// --- FOOTER ---

export interface SmartDrawerFooterProps {
  /** Custom className */
  className?: string;
  /** Override prev button */
  renderPrevButton?: () => ReactNode;
  /** Override next button */
  renderNextButton?: () => ReactNode;
  /** Custom status text */
  statusText?: string;
}

export function SmartDrawerFooter({ className, renderPrevButton, renderNextButton, statusText }: SmartDrawerFooterProps) {
  const { activeMission, currentStep, fieldErrors, actions } = useSmartDrawerContext();

  if (!activeMission || !currentStep) return null;

  const defaultStatusText = currentStep.targetField
    ? `Focusing on ${currentStep.targetField}...`
    : "Reading...";

  const isPrevDisabled = activeMission.steps.indexOf(currentStep) === 0;
  const isNextDisabled =
    (currentStep.targetField && !!(fieldErrors as Record<string, unknown>)?.[currentStep.targetField]) ||
    activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1;

  const isLastStep = activeMission.steps.indexOf(currentStep) === activeMission.steps.length - 1;

  return (
    <div className={cn("p-4 bg-chalo-surface border-t border-chalo-border shrink-0", className)}>
      <div className="flex items-center justify-between space-x-2">
        {renderPrevButton ? (
          renderPrevButton()
        ) : (
          <button
            onClick={actions.prevStep}
            disabled={isPrevDisabled}
            className="p-3 text-chalo-text-muted hover:text-chalo-text disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="flex-1 bg-chalo-surface-muted rounded-xl px-4 py-3 flex items-center overflow-hidden">
          <span className="text-sm text-chalo-text-muted flex-1 truncate">
            {statusText || defaultStatusText}
          </span>
        </div>

        {renderNextButton ? (
          renderNextButton()
        ) : (
          <button
            onClick={actions.nextStep}
            disabled={isNextDisabled}
            className={cn("p-3 bg-chalo-primary hover:bg-chalo-primary-hover text-chalo-text-inverse rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50")}
          >
            {isLastStep ? <CheckCircle2 size={20} /> : <Send size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

// --- RESUME PROMPT ---

export interface SmartDrawerResumePromptProps {
  /** Custom className */
  className?: string;
  /** Custom className for the placeholder */
  placeholderClassName?: string;
  /** Custom resume prompt data (overrides context/hook data) */
  resumePrompt?: SmartDrawerState['resumePrompt'];
}

export function SmartDrawerResumePrompt({ className, placeholderClassName, resumePrompt: customResumePrompt }: SmartDrawerResumePromptProps) {
  const drawerState = useSmartDrawer();
  const prompt = customResumePrompt || drawerState.resumePrompt;

  if (!prompt.show || !prompt.mission) return null;

  return (
    <>
      {/* Placeholder: stays in flex flow to push content */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 400 }}
        exit={{ width: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn('h-screen w-100 shrink-0', placeholderClassName)}
        data-chalo-drawer-placeholder="true"
      />

      {/* Actual resume prompt: fixed with high z-index */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn("fixed top-0 right-0 h-screen w-100 bg-chalo-surface/95 backdrop-blur-xl border-l border-chalo-border shadow-2xl flex flex-col z-10000", className)}
        data-chalo-drawer="true"
      >
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-chalo-warning-light rounded-2xl">
            <RotateCcw size={32} className="text-chalo-warning" />
          </div>
          <h3 className="text-lg font-bold text-chalo-text">Resume Tour?</h3>
          <p className="text-sm text-chalo-text-secondary">
            You were taking the <strong>{prompt.mission.title}</strong> tour. Would you like to continue where you left off?
          </p>
          <div className="flex flex-col w-full space-y-2 pt-2">
            <button
              onClick={prompt.onResume}
              className="w-full py-3 rounded-xl bg-chalo-primary text-chalo-text-inverse font-semibold hover:bg-chalo-primary-hover shadow-lg shadow-chalo-primary/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Resume Tour</span>
            </button>
            <button
              onClick={prompt.onDismiss}
              className="w-full py-3 rounded-xl border border-chalo-border text-chalo-text-secondary font-medium hover:bg-chalo-surface-subtle transition-all text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// --- TRIGGER ---

export interface SmartDrawerTriggerProps {
  children: ReactNode | ((state: { isOpen: boolean; toggle: () => void; open: () => void; close: () => void }) => ReactNode);
  /** Custom className for button (if children is not a function) */
  className?: string;
}

export function SmartDrawerTrigger({ children, className }: SmartDrawerTriggerProps) {
  const { isOpen, toggle, open, close } = useSmartDrawerContext();

  if (typeof children === 'function') {
    return <>{children({ isOpen, toggle, open, close })}</>;
  }

  return (
    <button
      onClick={toggle}
      className={cn("px-4 py-2 rounded-xl bg-chalo-primary text-chalo-text-inverse font-semibold hover:bg-chalo-primary-hover shadow-md transition-all", className)}
    >
      {children}
    </button>
  );
}

// =============================
// DEFAULT SMART DRAWER (Pre-composed)
// =============================

export interface SmartDrawerProps {
  /** Custom className for drawer panel */
  className?: string;
  /** Main header title */
  headerTitle?: string;
  /** Mission title (sub-header) */
  title?: string;
  /** Header icon */
  icon?: React.ElementType;
}

/**
 * Default SmartDrawer component - uses fixed positioning to escape stacking contexts.
 *
 * For custom compositions, use the compound components directly:
 * - SmartDrawer.Root
 * - SmartDrawer.Header
 * - SmartDrawer.Body
 * - SmartDrawer.Footer
 * - SmartDrawer.ResumePrompt
 * - SmartDrawer.Trigger
 *
 * Or use the `useSmartDrawer` hook for full control.
 */
export function SmartDrawer({
  className,
  headerTitle,
  title,
  icon
}: SmartDrawerProps) {
  return (
    <>
      <SmartDrawerRoot className={className}>
        <SmartDrawerHeader
          headerTitle={headerTitle}
          title={title}
          icon={icon}
        />
        <SmartDrawerBody />
        <SmartDrawerFooter />
      </SmartDrawerRoot>
      <SmartDrawerResumePrompt />
    </>
  );
}

// Attach compound components to SmartDrawer for namespaced access
SmartDrawer.Root = SmartDrawerRoot;
SmartDrawer.Header = SmartDrawerHeader;
SmartDrawer.Body = SmartDrawerBody;
SmartDrawer.Footer = SmartDrawerFooter;
SmartDrawer.ResumePrompt = SmartDrawerResumePrompt;
SmartDrawer.Trigger = SmartDrawerTrigger;
