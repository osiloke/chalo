import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChaloStore } from '../store';
import { MissionId, StepId, SuccessCondition, Action } from '../types';
import { UseFormReturn, RegisterOptions, FieldValues, Path, PathValue } from 'react-hook-form';
import { isPageReload } from '../utils/reload';

export interface UseChaloOptions<TFieldValues extends FieldValues = FieldValues> {
  form?: UseFormReturn<TFieldValues>;
  onMissionComplete?: (missionId: MissionId) => void;
  onStepChange?: (stepId: StepId) => void;
  /** Enable debug logging to console. Default: false. */
  debug?: boolean;
}

// ---------------------------------------------------------------------------
// Debug logger factory – creates a no-op logger when debug is disabled so
// there is zero runtime cost in production / non-debug mode.
// ---------------------------------------------------------------------------
type DebugLogFn = (actionName: string, payload?: Record<string, unknown>) => void;

function createDebugLogger(debugEnabled: boolean): DebugLogFn {
  if (!debugEnabled) {
    // No-op: the JS engine will inline and eliminate calls to this function.
    return () => { };
  }

  return (actionName: string, payload?: Record<string, unknown>) => {
    console.debug(
      `%c[use-chalo] %c${actionName}`,
      'color: #8b5cf6; font-weight: bold;',
      'color: #a78bfa;',
      payload !== undefined ? payload : '',
    );
  };
}

export function useChalo<TFieldValues extends FieldValues = FieldValues>(options: UseChaloOptions<TFieldValues> = {}) {
  const { form, onMissionComplete, onStepChange, debug = false } = options;

  const log = useMemo(() => createDebugLogger(debug), [debug]);

  // Use specific selectors for better stability
  const activeMissionId = useChaloStore(s => s.activeMissionId);
  const currentStepId = useChaloStore(s => s.currentStepId);
  const isCompleted = useChaloStore(s => s.isCompleted);
  const isPaused = useChaloStore(s => s.isPaused);
  const missions = useChaloStore(s => s.missions);
  const fieldValues = useChaloStore(s => s.fieldValues);
  const fieldStates = useChaloStore(s => s.fieldStates);
  const interactionHistory = useChaloStore(s => s.interactionHistory);

  // Actions (wrapped with debug logging)
  const _updateFieldInStore = useChaloStore(s => s.updateField);
  const updateFieldInStore = useCallback<typeof _updateFieldInStore>((name, value, status) => {
    log('updateField', { name, status });
    _updateFieldInStore(name, value, status);
  }, [_updateFieldInStore, log]);

  const _startMissionInStore = useChaloStore(s => s.startMission);
  const _pauseMissionInStore = useChaloStore(s => s.pauseMission);
  const pauseMissionInStore = useCallback<typeof _pauseMissionInStore>(() => {
    log('pauseMission');
    _pauseMissionInStore();
  }, [_pauseMissionInStore, log]);

  const _resumeMissionInStore = useChaloStore(s => s.resumeMission);
  const resumeMissionInStore = useCallback<typeof _resumeMissionInStore>(() => {
    log('resumeMission');
    _resumeMissionInStore();
  }, [_resumeMissionInStore, log]);

  const _completeMission = useChaloStore(s => s.completeMission);
  const completeMission = useCallback<typeof _completeMission>(() => {
    log('completeMission');
    _completeMission();
  }, [_completeMission, log]);

  const _goToStep = useChaloStore(s => s.goToStep);
  const goToStep = useCallback<typeof _goToStep>((stepId) => {
    log('goToStep', { stepId });
    _goToStep(stepId);
  }, [_goToStep, log]);

  const _reset = useChaloStore(s => s.reset);
  const reset = useCallback<typeof _reset>(() => {
    log('reset');
    _reset();
  }, [_reset, log]);

  const _resetMission = useChaloStore(s => s.resetMission);
  const resetMission = useCallback<typeof _resetMission>(() => {
    log('resetMission');
    _resetMission();
  }, [_resetMission, log]);

  const _dismissAllTours = useChaloStore(s => s.dismissAllTours);
  const dismissAllTours = useCallback<typeof _dismissAllTours>(() => {
    log('dismissAllTours');
    _dismissAllTours();
  }, [_dismissAllTours, log]);

  const _markMissionCompleted = useChaloStore(s => s.markMissionCompleted);
  const markMissionCompleted = useCallback<typeof _markMissionCompleted>((missionId) => {
    log('markMissionCompleted', { missionId });
    _markMissionCompleted(missionId);
  }, [_markMissionCompleted, log]);

  const _registerActionHandler = useChaloStore(s => s.registerActionHandler);
  const registerActionHandler = useCallback<typeof _registerActionHandler>((type, handler) => {
    log('registerActionHandler', { type });
    _registerActionHandler(type, handler);
  }, [_registerActionHandler, log]);

  const _executeAction = useChaloStore(s => s.executeAction);
  const executeAction = useCallback<typeof _executeAction>((action) => {
    log('executeAction', { type: action.type });
    return _executeAction(action);
  }, [_executeAction, log]);

  const _executeActionSequence = useChaloStore(s => s.executeActionSequence);
  const executeActionSequence = useCallback<typeof _executeActionSequence>((actions, stepId) => {
    log('executeActionSequence', { stepId, count: actions.length });
    return _executeActionSequence(actions, stepId);
  }, [_executeActionSequence, log]);

  const _recordExecutedStep = useChaloStore(s => s.recordExecutedStep);

  const _cancelExecution = useChaloStore(s => s.cancelExecution);
  const cancelExecution = useCallback<typeof _cancelExecution>(() => {
    log('cancelExecution');
    _cancelExecution();
  }, [_cancelExecution, log]);

  const _addInteraction = useChaloStore(s => s.addInteraction);
  const addInteraction = useCallback<typeof _addInteraction>((stepId, actionText) => {
    log('addInteraction', { stepId, actionText });
    _addInteraction(stepId, actionText);
  }, [_addInteraction, log]);

  const _registerMission = useChaloStore(s => s.registerMission);
  const registerMission = useCallback<typeof _registerMission>((mission) => {
    log('registerMission', { missionId: mission.id });
    _registerMission(mission);
  }, [_registerMission, log]);

  const _recordTourEntry = useChaloStore(s => s.recordTourEntry);
  const recordTourEntry = useCallback<typeof _recordTourEntry>((missionId, stepId, completed) => {
    log('recordTourEntry', { missionId, stepId, completed });
    _recordTourEntry(missionId, stepId, completed);
  }, [_recordTourEntry, log]);

  // Additional state selectors (completedMissions, executionContext, tourHistory)
  const completedMissions = useChaloStore(s => s.completedMissions);
  const executionContext = useChaloStore(s => s.executionContext);
  const tourHistory = useChaloStore(s => s.tourHistory);

  // Wrap startMission to record tour entry (uses raw store actions to avoid double-logging)
  const startMission = useCallback((missionId: MissionId) => {
    log('startMission', { missionId });
    _recordTourEntry(missionId, '', false);
    _startMissionInStore(missionId);
  }, [_startMissionInStore, _recordTourEntry, log]);

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
    hasHandledReloadRef.current = false;
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
        return fieldValues[condition.field] == condition.value;
      case 'field_touched':
        if (!condition.field) return false;
        return (fieldStates[condition.field] || 'idle') !== 'idle';
      case 'element_exists': {
        if (!condition.field) return false;
        const selector = `[data-chalo-field="${condition.field}"], #chalo-${condition.field}, [name="${condition.field}"], #${condition.field}`;
        const el = document.querySelector(selector);
        return condition.exists === false ? !el : !!el;
      }
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
      log('nextStep', { missionId: activeMission.id, stepId: steps[currentIndex + 1].id });
      _recordTourEntry(activeMission.id, steps[currentIndex + 1].id, false);
      _goToStep(steps[currentIndex + 1].id);
    } else {
      log('nextStep', { missionId: activeMission.id, completing: true });
      _recordTourEntry(activeMission.id, currentStepId, true);
      _completeMission();
    }
  }, [activeMission, currentStepId, log, _recordTourEntry, _goToStep, _completeMission]);

  const prevStep = useCallback(() => {
    if (!activeMission || !currentStepId) return;
    const steps = activeMission.steps;
    const currentIndex = steps.findIndex((s) => s.id === currentStepId);
    if (currentIndex > 0) {
      log('prevStep', { stepId: steps[currentIndex - 1].id });
      _goToStep(steps[currentIndex - 1].id);
    }
  }, [activeMission, currentStepId, log, _goToStep]);

  // Auto-execute action sequence when step changes and has actions
  // Handles reload detection and executeOnReload flag
  const hasHandledReloadRef = useRef(false);

  useEffect(() => {
    if (!currentStep?.actionSequence || !currentStepId || !activeMissionId) return;

    const isReload = isPageReload();
    const wasPreviouslyExecuted = executedSequenceRef.current.has(currentStepId);
    const shouldExecuteOnReload = currentStep.executeOnReload === true;
    const hasReloadActions = currentStep.actionSequence.some((action: Action) => action.executeOnReload === true);

    // Check if conditions are met
    const conditionsMet = !currentStep.condition || evaluateCondition(currentStep.condition);

    // Decision logic for execution:
    // 1. Normal flow (not reload): execute if not previously executed AND conditions met
    // 2. Reload without flags: skip execution (DOM state reset, conditions likely fail)
    // 3. Reload with step.executeOnReload: force execute all actions
    // 4. Reload with action.executeOnReload: execute only marked actions

    if (!isReload && wasPreviouslyExecuted) {
      // Already executed in this session, skip
      return;
    }

    if (isReload && !wasPreviouslyExecuted && !shouldExecuteOnReload && !hasReloadActions) {
      // First time seeing this step after reload, but no reload flags
      // Only execute if conditions are met
      if (!conditionsMet) return;
    }

    if (isReload && wasPreviouslyExecuted && !shouldExecuteOnReload && !hasReloadActions) {
      // Was executed before reload, no reload flags, skip
      return;
    }

    // Mark as handled for this reload cycle
    if (isReload && !hasHandledReloadRef.current) {
      hasHandledReloadRef.current = true;
    }

    // Execute appropriate actions
    if (isReload && !conditionsMet && hasReloadActions) {
      // Execute only actions marked with executeOnReload
      const reloadActions = currentStep.actionSequence.filter(
        (action: Action) => action.executeOnReload === true
      );
      log('executeActionSequence (reload actions only)', {
        stepId: currentStepId,
        actionCount: reloadActions.length
      });
      executedSequenceRef.current.add(currentStepId);
      executeActionSequence(reloadActions, currentStepId);
    } else if (conditionsMet || shouldExecuteOnReload) {
      // Execute all actions
      log('executeActionSequence', { stepId: currentStepId, actionCount: currentStep.actionSequence.length });
      executedSequenceRef.current.add(currentStepId);
      executeActionSequence(currentStep.actionSequence, currentStepId);
    }

    // Record in persisted state for reload tracking
    if (activeMissionId) {
      _recordExecutedStep(activeMissionId, currentStepId);
    }
  }, [currentStepId, currentStep?.actionSequence, currentStep?.condition, currentStep?.executeOnReload, executeActionSequence, evaluateCondition, activeMissionId, _recordExecutedStep, log]);

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
      log('fillField', { name });
      formUpdatedRef.current.add(name);
      _updateFieldInStore(name, value, 'valid');
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
    [form, log, _updateFieldInStore]
  );

  // Public API: update a field value in the store (simpler than fillField, no form sync)
  const updateField = useCallback(
    (name: string, value: unknown, status?: 'idle' | 'focused' | 'valid' | 'invalid') => {
      log('updateField', { name, value });
      _updateFieldInStore(name, value, status);
    },
    [log, _updateFieldInStore]
  );

  const registerField = useCallback(
    (name: Path<TFieldValues>, rhfOptions?: RegisterOptions<TFieldValues>) => {
      log('registerField', { name });
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
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            _updateFieldInStore(name, e.target.value),
          onFocus: () => _updateFieldInStore(name, fieldValues[name], 'focused'),
          onBlur: () => _updateFieldInStore(name, fieldValues[name], 'idle'),
        };
      }
      const registered = form.register(name, rhfOptions);
      return {
        ...registered,
        id: fieldId,
        'data-chalo-field': String(name),
        onChange: async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onChange(e);
          _updateFieldInStore(name, e.target.value);
        },
        onBlur: async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onBlur(e);
          _updateFieldInStore(name, fieldValues[name], 'idle');
        }
      };
    },
    [form, _updateFieldInStore, fieldValues, log]
  );

  // registerElement: attribute a ref callback that sets data-chalo-field on any
  // DOM element (buttons, links, etc.) so action engine can target it by name.
  const registerElement = useCallback((name: string) => {
    log('registerElement', { name });
    return (el: HTMLElement | null) => {
      if (el) {
        el.setAttribute('data-chalo-field', name);
        el.id = el.id || `chalo-${name}`;
      }
    };
  }, [log]);

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
    registerElement,
    fillField,
    updateField,
    recordTourEntry,
    tourHistory,
    evaluateCondition,
  };
}
