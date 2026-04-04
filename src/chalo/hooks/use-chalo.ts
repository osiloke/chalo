import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChaloStore } from '../store';
import { MissionId, StepId, SuccessCondition } from '../types';
import { UseFormReturn, RegisterOptions, FieldValues, Path, PathValue } from 'react-hook-form';

export interface UseChaloOptions<TFieldValues extends FieldValues = FieldValues> {
  form?: UseFormReturn<TFieldValues>;
  onMissionComplete?: (missionId: MissionId) => void;
  onStepChange?: (stepId: StepId) => void;
}

export function useChalo<TFieldValues extends FieldValues = FieldValues>(options: UseChaloOptions<TFieldValues> = {}) {
  const { form, onMissionComplete, onStepChange } = options;

  // Use specific selectors for better stability
  const activeMissionId = useChaloStore(s => s.activeMissionId);
  const currentStepId = useChaloStore(s => s.currentStepId);
  const isCompleted = useChaloStore(s => s.isCompleted);
  const isPaused = useChaloStore(s => s.isPaused);
  const missions = useChaloStore(s => s.missions);
  const fieldValues = useChaloStore(s => s.fieldValues);
  const fieldStates = useChaloStore(s => s.fieldStates);
  const interactionHistory = useChaloStore(s => s.interactionHistory);

  // Actions
  const updateFieldInStore = useChaloStore(s => s.updateField);
  const startMissionInStore = useChaloStore(s => s.startMission);
  const pauseMissionInStore = useChaloStore(s => s.pauseMission);
  const resumeMissionInStore = useChaloStore(s => s.resumeMission);
  const completeMission = useChaloStore(s => s.completeMission);
  const goToStep = useChaloStore(s => s.goToStep);
  const reset = useChaloStore(s => s.reset);
  const resetMission = useChaloStore(s => s.resetMission);
  const dismissAllTours = useChaloStore(s => s.dismissAllTours);
  const markMissionCompleted = useChaloStore(s => s.markMissionCompleted);
  const completedMissions = useChaloStore(s => s.completedMissions);
  const executionContext = useChaloStore(s => s.executionContext);
  const registerActionHandler = useChaloStore(s => s.registerActionHandler);
  const executeAction = useChaloStore(s => s.executeAction);
  const executeActionSequence = useChaloStore(s => s.executeActionSequence);
  const cancelExecution = useChaloStore(s => s.cancelExecution);
  const addInteraction = useChaloStore(s => s.addInteraction);
  const registerMission = useChaloStore(s => s.registerMission);
  const recordTourEntry = useChaloStore(s => s.recordTourEntry);
  const tourHistory = useChaloStore(s => s.tourHistory);

  // Wrap startMission to record tour entry
  const startMission = useCallback((missionId: MissionId) => {
    recordTourEntry(missionId, '', false);
    startMissionInStore(missionId);
  }, [startMissionInStore, recordTourEntry]);

  const fieldErrors = useMemo(() => form?.formState.errors || {}, [form?.formState.errors]);

  const getMission = useCallback((id: MissionId) => missions[id] || undefined, [missions]);

  const activeMission = useMemo(() => {
    if (!activeMissionId) return null;
    return getMission(activeMissionId) || null;
  }, [activeMissionId, getMission]);

  const currentStep = useMemo(() => {
    if (!activeMission || !currentStepId) return null;
    return activeMission.steps.find((s) => s.id === currentStepId) || null;
  }, [activeMission, currentStepId]);

  // --- BIDIRECTIONAL SYNC: Form ↔ Store ---

  // Track previous store values to detect external changes and prevent loops
  const prevFieldValuesRef = useRef<Record<string, unknown>>({});
  // Track which fields were updated by the form (to skip reverse-sync for them)
  const formUpdatedRef = useRef<Set<string>>(new Set());

  // Direction 1: Form → Store (on any form value change)
  useEffect(() => {
    if (!form || !activeMissionId) return;

    const subscription = form.watch((value, { name }) => {
      if (name) {
        const val = value[name];
        formUpdatedRef.current.add(name);
        updateFieldInStore(name, val);
      } else {
        // Bulk update (e.g. from reset)
        Object.entries(value).forEach(([n, v]) => {
          formUpdatedRef.current.add(n);
          updateFieldInStore(n, v);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, activeMissionId, updateFieldInStore]);

  // Direction 2: Store → Form (reverse sync when store changes externally)
  useEffect(() => {
    if (!form || !activeMissionId) return;

    Object.entries(fieldValues).forEach(([name, storeVal]) => {
      // Skip if this change originated from the form itself
      if (formUpdatedRef.current.has(name)) {
        formUpdatedRef.current.delete(name);
        prevFieldValuesRef.current[name] = storeVal;
        return;
      }

      // Only update form if the store value actually changed
      const prevVal = prevFieldValuesRef.current[name];
      if (prevVal !== storeVal) {
        try {
          form.setValue(name as Path<TFieldValues>, storeVal as PathValue<TFieldValues, Path<TFieldValues>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        } catch {
          // Field may not be registered in this form (e.g., modal form field)
        }
        prevFieldValuesRef.current[name] = storeVal;
      }
    });
  }, [fieldValues, form, activeMissionId]);

  // Handle focus when step changes + pre-populate from store
  useEffect(() => {
    if (currentStep?.targetField && form) {
      // Pre-populate the field from store value if it exists
      const storeVal = fieldValues[currentStep.targetField];
      if (storeVal !== undefined) {
        try {
          form.setValue(currentStep.targetField as Path<TFieldValues>, storeVal as PathValue<TFieldValues, Path<TFieldValues>>);
        } catch {
          // Field may not exist in this form
        }
      }
      setTimeout(() => {
        form.setFocus(currentStep.targetField as Path<TFieldValues>);
      }, 100);
    }

    // Clear any DOM-based waitFor signals from previous interactions
    if (currentStep?.waitFor?.type === 'custom' && currentStep.targetElement) {
      const el = document.querySelector(currentStep.targetElement);
      if (el) el.removeAttribute('data-clicked');
    }

    if (onStepChange && currentStepId) {
      onStepChange(currentStepId);
    }
  }, [currentStepId, currentStep, form, onStepChange, fieldValues]);

  // Auto-execute action sequence when step changes and has actions
  const executedSequenceRef = useRef<Set<string>>(new Set());

  // Reset executed sequences when mission changes
  useEffect(() => {
    executedSequenceRef.current.clear();
  }, [activeMissionId]);

  // Handle mission completion
  useEffect(() => {
    if (isCompleted && activeMissionId && onMissionComplete) {
      onMissionComplete(activeMissionId);
    }
  }, [isCompleted, activeMissionId, onMissionComplete]);

  // Progress calculation
  const missionProgress = useMemo(() => {
    if (!activeMission || !currentStepId) return 0;
    const currentIndex = activeMission.steps.findIndex((s) => s.id === currentStepId);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / activeMission.steps.length) * 100);
  }, [activeMission, currentStepId]);

  // Condition evaluator for successCondition / waitFor
  const evaluateCondition = useCallback((condition?: SuccessCondition): boolean => {
    if (!condition) return true;
    switch (condition.type) {
      case 'field_value':
        if (!condition.field) return false;
        // Use loose equality to handle type coercion (e.g., "5" == 5)
        // eslint-disable-next-line eqeqeq
        return fieldValues[condition.field] == condition.value;
      case 'field_touched':
        if (!condition.field) return false;
        return (fieldStates[condition.field] || 'idle') !== 'idle';
      case 'custom':
        if (condition.predicate) {
          return condition.predicate(fieldValues, form?.getValues());
        }
        return false;
      default:
        return true;
    }
  }, [fieldValues, fieldStates, form]);

  // Methods
  const nextStep = useCallback(() => {
    if (!activeMission || !currentStepId) return;
    const steps = activeMission.steps;
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    if (currentIndex < steps.length - 1) {
      recordTourEntry(activeMission.id, steps[currentIndex + 1].id, false);
      goToStep(steps[currentIndex + 1].id);
    } else {
      recordTourEntry(activeMission.id, currentStepId, true);
      completeMission();
    }
  }, [activeMission, currentStepId, goToStep, completeMission, recordTourEntry]);

  const prevStep = useCallback(() => {
    if (!activeMission || !currentStepId) return;
    const steps = activeMission.steps;
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].id);
    }
  }, [activeMission, currentStepId, goToStep]);

  // Auto-execute action sequence when step changes and has actions
  useEffect(() => {
    if (!currentStep?.actionSequence || !currentStepId) return;
    if (executedSequenceRef.current.has(currentStepId)) return;

    // Check step-level condition: only auto-execute if condition is met (or not set)
    if (currentStep.condition && !evaluateCondition(currentStep.condition)) return;

    executedSequenceRef.current.add(currentStepId);
    executeActionSequence(currentStep.actionSequence, currentStepId);
  }, [currentStepId, currentStep?.actionSequence, currentStep?.condition, executeActionSequence, evaluateCondition]);

  // Polling: check waitFor condition on current step and auto-advance when met
  // Per-step tracking: use a Set so consecutive steps with waitFor don't interfere
  const waitForCheckedStepsRef = useRef<Set<StepId>>(new Set());
  // Ref for setTimeout to allow cleanup on unmount/step change
  const waitForTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref for nextStep to avoid stale closure in setTimeout
  const nextStepRef = useRef(nextStep);
  // Keep ref in sync
  useEffect(() => {
    nextStepRef.current = nextStep;
  }, [nextStep]);

  useEffect(() => {
    // Clear any pending timeout from previous step
    if (waitForTimeoutRef.current) {
      clearTimeout(waitForTimeoutRef.current);
      waitForTimeoutRef.current = null;
    }

    if (!currentStep?.waitFor) {
      waitForCheckedStepsRef.current.clear();
      return;
    }

    // Skip if this specific step was already checked
    if (waitForCheckedStepsRef.current.has(currentStep.id)) return;

    const interval = setInterval(() => {
      if (evaluateCondition(currentStep.waitFor!)) {
        waitForCheckedStepsRef.current.add(currentStep.id);
        clearInterval(interval);
        // Use ref to get current nextStep, avoiding stale closure
        waitForTimeoutRef.current = setTimeout(() => {
          nextStepRef.current();
          waitForTimeoutRef.current = null;
        }, 600);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      if (waitForTimeoutRef.current) {
        clearTimeout(waitForTimeoutRef.current);
        waitForTimeoutRef.current = null;
      }
    };
  }, [currentStep?.id, currentStep?.waitFor, evaluateCondition]);

  // Generic fillField: works with any string key, updates store always,
  // and attempts to update the primary form if the field is registered there.
  // This enables cross-form updates (e.g., bubble auto-fill reaching a modal form).
  const fillField = useCallback(
    (name: string, value: unknown) => {
      formUpdatedRef.current.add(name);
      updateFieldInStore(name, value);
      if (form) {
        try {
          form.setValue(name as Path<TFieldValues>, value as PathValue<TFieldValues, Path<TFieldValues>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        } catch {
          // Field may not be registered in this form
        }
      }
    },
    [form, updateFieldInStore]
  );

  const registerField = useCallback(
    (name: Path<TFieldValues>, rhfOptions?: RegisterOptions<TFieldValues>) => {
      // Pre-populate from store if a value already exists
      if (fieldValues[name] !== undefined && form) {
        try {
          form.setValue(name, fieldValues[name] as PathValue<TFieldValues, Path<TFieldValues>>);
        } catch {
          // Field may have incompatible type
        }
      }

      // Auto-generate a stable id for DOM targeting by action engine
      const fieldId = `chalo-${String(name)}`;

      if (!form) {
        return {
          id: fieldId,
          name,
          'data-chalo-field': String(name),
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            updateFieldInStore(name, e.target.value),
          onFocus: () => updateFieldInStore(name, fieldValues[name], 'focused'),
          onBlur: () => updateFieldInStore(name, fieldValues[name], 'idle'),
        };
      }
      const registered = form.register(name, rhfOptions);
      return {
        ...registered,
        id: fieldId,
        'data-chalo-field': String(name),
        onChange: async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onChange(e);
          updateFieldInStore(name, e.target.value);
        },
        onBlur: async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onBlur(e);
          updateFieldInStore(name, fieldValues[name], 'idle');
        }
      };
    },
    [form, updateFieldInStore, fieldValues]
  );

  return {
    activeMissionId,
    currentStepId,
    isCompleted,
    isPaused,
    missions,
    fieldValues,
    fieldStates,
    interactionHistory,
    startMission,
    pauseMission: pauseMissionInStore,
    resumeMission: resumeMissionInStore,
    completeMission,
    goToStep,
    reset,
    resetMission,
    dismissAllTours,
    markMissionCompleted,
    completedMissions,
    executionContext,
    registerActionHandler,
    executeAction,
    executeActionSequence,
    cancelExecution,
    addInteraction,
    registerMission,
    activeMission,
    currentStep,
    missionProgress,
    fieldErrors,
    nextStep,
    prevStep,
    registerField,
    fillField,
    recordTourEntry,
    tourHistory,
    evaluateCondition,
  };
}

/**
 * Bidirectional sync hook for secondary forms (e.g., modal forms).
 * Call this in any component that has a `useForm` instance and wants
 * its fields to stay in sync with the Chalo store.
 */
export function useChaloFieldSync<TFieldValues extends FieldValues = FieldValues>(
  form: UseFormReturn<TFieldValues>,
  enabled = true,
) {
  const fieldValues = useChaloStore(s => s.fieldValues);
  const updateFieldInStore = useChaloStore(s => s.updateField);
  const formUpdatedRef = useRef<Set<string>>(new Set());
  const prevFieldValuesRef = useRef<Record<string, unknown>>({});

  // Direction 1: Form → Store
  useEffect(() => {
    if (!enabled) return;
    const subscription = form.watch((value, { name }) => {
      if (name) {
        formUpdatedRef.current.add(name);
        updateFieldInStore(name, value[name]);
      } else {
        Object.entries(value).forEach(([n, v]) => {
          formUpdatedRef.current.add(n);
          updateFieldInStore(n, v);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFieldInStore, enabled]);

  // Direction 2: Store → Form
  useEffect(() => {
    if (!enabled) return;
    Object.entries(fieldValues).forEach(([name, storeVal]) => {
      if (formUpdatedRef.current.has(name)) {
        formUpdatedRef.current.delete(name);
        prevFieldValuesRef.current[name] = storeVal;
        return;
      }
      const prevVal = prevFieldValuesRef.current[name];
      if (prevVal !== storeVal) {
        try {
          form.setValue(name as Path<TFieldValues>, storeVal as PathValue<TFieldValues, Path<TFieldValues>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        } catch {
          // Field may not be registered
        }
        prevFieldValuesRef.current[name] = storeVal;
      }
    });
  }, [fieldValues, form, enabled]);
}
