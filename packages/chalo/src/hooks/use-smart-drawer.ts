import { useEffect, useState, useMemo, useCallback } from 'react';
import { useChaloStore } from '../store';
import { useChalo } from './use-chalo';
import { StepAction, Action, FieldValueSource } from '../types';

// --- VALUE RESOLVER (mirrors action-engine for bubble fill_field) ---

function resolveFillValue(value: unknown, fieldValues: Record<string, unknown>): unknown {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const src = value as FieldValueSource;
    if (src.type === 'ref' && 'field' in src) {
      return fieldValues[src.field];
    }
    if (src.type === 'fn' && 'generator' in src && typeof src.generator === 'function') {
      return (src.generator as () => unknown)();
    }
  }
  return value;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: React.ReactNode;
}

export interface UseSmartDrawerOptions {
  debug?: boolean;
  /** Typing delay in ms before showing next bubble (default: 1200) */
  typingDelay?: number;
  /** Disable action interaction messages from being added to chat history (default: false) */
  disableActionInteractions?: boolean;
}

export interface ResumePromptData {
  show: boolean;
  mission?: {
    id: string;
    title: string;
  };
  lastStepId?: string;
  onResume: () => void;
  onDismiss: () => void;
}

export interface SmartDrawerState {
  /** Whether the drawer should be open */
  isOpen: boolean;
  /** Manually open the drawer */
  open: () => void;
  /** Manually close the drawer */
  close: () => void;
  /** Toggle drawer open/close */
  toggle: () => void;
  /** Dismiss current tour entirely */
  dismiss: () => void;
  /** Current active mission */
  activeMission: ReturnType<typeof useChalo>['activeMission'];
  /** Current step in the mission */
  currentStep: ReturnType<typeof useChalo>['currentStep'];
  /** Generated chat history */
  chatHistory: ChatMessage[];
  /** Whether the typing indicator should show */
  isTyping: boolean;
  /** Field values from form */
  fieldValues: Record<string, unknown>;
  /** Field errors from validation */
  fieldErrors: Record<string, unknown>;
  /** Execution context for action sequences */
  executionContext: ReturnType<typeof useChalo>['executionContext'];
  /** Whether there's no active mission/step */
  isComplete: boolean;
  /** Current displayed step ID (for typing delay) */
  displayedStepId: string | null;
  /** Resume prompt data if there's an incomplete tour */
  resumePrompt: ResumePromptData;
  /** Action handlers for the drawer */
  actions: {
    fillField: (field: string, value: unknown) => void;
    nextStep: () => void;
    prevStep: () => void;
    cancelExecution: () => void;
    executeActionSequence: (actions: Action[]) => void;
    handleBubbleInteraction: (text: string) => void;
    handleLegacyAction: (action: StepAction) => void;
    /** Whether action interaction messages are disabled */
    disableActionInteractions: boolean;
  };
}

/**
 * Hook that encapsulates all SmartDrawer business logic.
 * Provides state, handlers, and computed data for building custom drawer UIs.
 *
 * @example
 * ```tsx
 * const drawer = useSmartDrawer();
 *
 * if (drawer.isOpen) {
 *   return createPortal(
 *     <SmartDrawer.Root>
 *       <SmartDrawer.Header />
 *       <SmartDrawer.Body />
 *       <SmartDrawer.Footer />
 *     </SmartDrawer.Root>,
 *     document.body
 *   );
 * }
 * ```
 */
export function useSmartDrawer(options: UseSmartDrawerOptions = {}): SmartDrawerState {
  const store = useChaloStore();
  const {
    activeMission,
    currentStep,
    nextStep,
    prevStep,
    fillField,
    fieldErrors,
    fieldValues,
    executionContext,
    cancelExecution,
    executeActionSequence
  } = useChalo({ debug: options.debug ?? import.meta.env.DEV });

  const typingDelay = options.typingDelay ?? 1200;
  const disableActionInteractions = options.disableActionInteractions ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedStepId, setDisplayedStepId] = useState<string | null>(null);

  // Sync open state with mission/pause state
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
      }, typingDelay);
      return () => clearTimeout(timer);
    }
  }, [currentStep, displayedStepId, typingDelay]);

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

  // Check for incomplete tour to show resume prompt
  const resumePrompt = useMemo((): ResumePromptData => {
    if (activeMission) {
      // Don't show resume prompt if there's an active mission
      return { show: false, onResume: () => { }, onDismiss: () => { } };
    }

    const incompleteTour = Object.values(store.tourHistory).find(
      (t) => !t.completed && t.lastAccessed > Date.now() - 7 * 24 * 60 * 60 * 1000 // within 7 days
    );

    if (incompleteTour) {
      const mission = store.missions[incompleteTour.missionId];
      if (mission) {
        return {
          show: true,
          mission: {
            id: mission.id,
            title: mission.title,
          },
          lastStepId: incompleteTour.lastStepId,
          onResume: () => {
            store.startMission(incompleteTour.missionId);
            if (incompleteTour.lastStepId) {
              store.goToStep(incompleteTour.lastStepId);
            }
          },
          onDismiss: () => store.recordTourEntry(incompleteTour.missionId, incompleteTour.lastStepId, true),
        };
      }
    }

    return { show: false, onResume: () => { }, onDismiss: () => { } };
  }, [activeMission, store]);

  const handleBubbleInteraction = useCallback((text: string) => {
    if (disableActionInteractions) return;
    store.addInteraction(currentStep?.id ?? '', text);
  }, [currentStep?.id, store, disableActionInteractions]);

  const handleLegacyAction = useCallback((action: StepAction) => {
    if (!currentStep) return;
    if (action.type === 'fill_field' && action.data) {
      const d = action.data as { field: string; value: unknown };
      const resolvedValue = resolveFillValue(d.value, fieldValues);
      fillField(d.field, resolvedValue);
      if (!disableActionInteractions) {
        store.addInteraction(currentStep.id, `Used auto-fill: ${resolvedValue}`);
      }
    } else if (action.type === 'click' && action.data) {
      const d = action.data as { selector: string };
      const el = document.querySelector(d.selector);
      if (el) {
        (el as HTMLElement).click();
        if (!disableActionInteractions) {
          store.addInteraction(currentStep.id, `Clicked: ${d.selector}`);
        }
      }
    } else if (action.type === 'trigger_action' && action.data) {
      const actions = Array.isArray(action.data) ? action.data : [action.data];
      executeActionSequence(actions, currentStep.id);
      if (!disableActionInteractions) {
        store.addInteraction(currentStep.id, `Triggered action sequence: ${action.label}`);
      }
    } else if (action.onClick) {
      action.onClick();
      if (!disableActionInteractions) {
        store.addInteraction(currentStep.id, `Selected: ${action.label}`);
      }
    }
  }, [fillField, currentStep, store, executeActionSequence, fieldValues, disableActionInteractions]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const dismiss = useCallback(() => {
    store.dismissAllTours();
    store.resetMission();
  }, [store]);

  const isComplete = !activeMission || !currentStep;

  return {
    isOpen,
    open,
    close,
    toggle,
    dismiss,
    activeMission,
    currentStep,
    chatHistory,
    isTyping,
    fieldValues,
    fieldErrors,
    executionContext,
    isComplete,
    displayedStepId,
    resumePrompt,
    actions: {
      fillField,
      nextStep,
      prevStep,
      cancelExecution,
      executeActionSequence,
      handleBubbleInteraction,
      handleLegacyAction,
      disableActionInteractions,
    },
  };
}
