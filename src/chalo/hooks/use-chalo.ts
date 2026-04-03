import { useCallback, useEffect, useMemo } from 'react';
import { useChaloStore } from '../store';
import { MissionId, StepId } from '../types';
import { UseFormReturn, RegisterOptions, FieldValues, Path, PathValue } from 'react-hook-form';

export interface UseChaloOptions<TFieldValues extends FieldValues = FieldValues> {
  form?: UseFormReturn<TFieldValues>;
  onMissionComplete?: (missionId: MissionId) => void;
  onStepChange?: (stepId: StepId) => void;
}

export function useChalo<TFieldValues extends FieldValues = FieldValues>(options: UseChaloOptions<TFieldValues> = {}) {
  const { form, onMissionComplete, onStepChange } = options;
  const store = useChaloStore();

  const fieldErrors = useMemo(() => form?.formState.errors || {}, [form?.formState.errors]);

  const getMission = useCallback((id: MissionId) => store.missions[id] || undefined, [store.missions]);

  const activeMission = useMemo(() => {
    if (!store.activeMissionId) return null;
    return getMission(store.activeMissionId) || null;
  }, [store.activeMissionId, getMission]);

  const currentStep = useMemo(() => {
    if (!activeMission || !store.currentStepId) return null;
    return activeMission.steps.find((s) => s.id === store.currentStepId) || null;
  }, [activeMission, store.currentStepId]);

  // Sync with react-hook-form
  useEffect(() => {
    if (!form || !store.activeMissionId) return;

    const subscription = form.watch((value, { name }) => {
      if (name) {
        store.updateField(name, value[name]);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, store.activeMissionId, store]);

  // Handle focus when step changes
  useEffect(() => {
    if (currentStep?.targetField && form) {
      setTimeout(() => {
        form.setFocus(currentStep.targetField as Path<TFieldValues>);
      }, 100);
    }
    if (onStepChange && store.currentStepId) {
      onStepChange(store.currentStepId);
    }
  }, [store.currentStepId, currentStep, form, onStepChange]);

  // Handle mission completion
  useEffect(() => {
    if (store.isCompleted && store.activeMissionId && onMissionComplete) {
      onMissionComplete(store.activeMissionId);
    }
  }, [store.isCompleted, store.activeMissionId, onMissionComplete]);

  // Progress calculation
  const missionProgress = useMemo(() => {
    if (!activeMission || !store.currentStepId) return 0;
    const currentIndex = activeMission.steps.findIndex((s) => s.id === store.currentStepId);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / activeMission.steps.length) * 100);
  }, [activeMission, store.currentStepId]);

  // Methods
  const nextStep = useCallback(() => {
    if (!activeMission || !store.currentStepId) return;
    const steps = activeMission.steps;
    const currentIndex = steps.findIndex((s) => s.id === store.currentStepId);
    if (currentIndex < steps.length - 1) {
      store.goToStep(steps[currentIndex + 1].id);
    } else {
      store.completeMission();
    }
  }, [activeMission, store]);

  const prevStep = useCallback(() => {
    if (!activeMission || !store.currentStepId) return;
    const steps = activeMission.steps;
    const currentIndex = steps.findIndex((s) => s.id === store.currentStepId);
    if (currentIndex > 0) {
      store.goToStep(steps[currentIndex - 1].id);
    }
  }, [activeMission, store]);

  const fillField = useCallback(
    (name: Path<TFieldValues>, value: PathValue<TFieldValues, Path<TFieldValues>>) => {
      if (form) {
        form.setValue(name, value, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        store.updateField(name, value);
      } else {
        store.updateField(name, value);
      }
    },
    [form, store]
  );

  const registerField = useCallback(
    (name: Path<TFieldValues>, rhfOptions?: RegisterOptions<TFieldValues>) => {
      if (!form) {
        return {
          id: name,
          name,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
            store.updateField(name, e.target.value),
          onFocus: () => store.updateField(name, store.fieldValues[name], 'focused'),
          onBlur: () => store.updateField(name, store.fieldValues[name], 'idle'),
        };
      }
      const registered = form.register(name, rhfOptions);
      return {
        ...registered,
        onChange: async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onChange(e);
          store.updateField(name, e.target.value);
        },
        onBlur: async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          await registered.onBlur(e);
          store.updateField(name, store.fieldValues[name], 'idle');
        }
      };
    },
    [form, store]
  );

  return {
    ...store,
    activeMission,
    currentStep,
    missionProgress,
    fieldErrors,
    nextStep,
    prevStep,
    registerField,
    fillField,
  };
}
