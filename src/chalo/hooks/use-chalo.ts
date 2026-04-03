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

  // Sync with react-hook-form
  useEffect(() => {
    if (!form || !activeMissionId) return;

    // Initial sync of all values
    const currentValues = form.getValues();
    Object.entries(currentValues).forEach(([name, value]) => {
      updateFieldInStore(name, value);
    });

    const subscription = form.watch((value, { name }) => {
      if (name) {
        updateFieldInStore(name, value[name]);
      } else {
        // Bulk update (e.g. from reset)
        Object.entries(value).forEach(([n, v]) => {
          updateFieldInStore(n, v);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, activeMissionId, updateFieldInStore]); // Dependencies are now granular

  // Handle focus when step changes
  useEffect(() => {
    if (currentStep?.targetField && form) {
      setTimeout(() => {
        form.setFocus(currentStep.targetField as Path<TFieldValues>);
      }, 100);
    }
    if (onStepChange && currentStepId) {
      onStepChange(currentStepId);
    }
  }, [currentStepId, currentStep, form, onStepChange]);

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
        return fieldValues[condition.field] === condition.value;
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

  // Polling: check waitFor condition on current step and auto-advance when met
  const waitForCheckedRef = useRef(false);
  useEffect(() => {
    if (!currentStep?.waitFor) {
      waitForCheckedRef.current = false;
      return;
    }
    if (waitForCheckedRef.current) return;

    const interval = setInterval(() => {
      if (evaluateCondition(currentStep.waitFor)) {
        waitForCheckedRef.current = true;
        clearInterval(interval);
        setTimeout(() => nextStep(), 600);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentStep?.id, currentStep?.waitFor, evaluateCondition, nextStep]);

  const fillField = useCallback(
    (name: Path<TFieldValues>, value: PathValue<TFieldValues, Path<TFieldValues>>) => {
      if (form) {
        form.setValue(name, value, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      updateFieldInStore(name, value);
    },
    [form, updateFieldInStore]
  );

  const registerField = useCallback(
    (name: Path<TFieldValues>, rhfOptions?: RegisterOptions<TFieldValues>) => {
      if (!form) {
        return {
          id: name,
          name,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
            updateFieldInStore(name, e.target.value),
          onFocus: () => updateFieldInStore(name, fieldValues[name], 'focused'),
          onBlur: () => updateFieldInStore(name, fieldValues[name], 'idle'),
        };
      }
      const registered = form.register(name, rhfOptions);
      return {
        ...registered,
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
