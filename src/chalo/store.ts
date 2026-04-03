import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChaloStore, Mission, MissionId, StepId, ChaloState } from './types';

const initialState: ChaloState = {
  activeMissionId: null,
  currentStepId: null,
  missionProgress: 0,
  fieldValues: {},
  fieldStates: {},
  missions: {},
  interactionHistory: [],
  isPaused: false,
  isCompleted: false,
  error: null,
};

export const useChaloStore = create<ChaloStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      registerMission: (mission: Mission) => {
        set((state) => ({
          missions: { ...state.missions, [mission.id]: mission }
        }));
      },

      startMission: (missionId: MissionId) => {
        const { missions } = get();
        const mission = missions[missionId];
        if (!mission) {
          console.error(`Mission "${missionId}" not found in registry.`);
          set({ error: `Mission "${missionId}" not found in registry.` });
          return;
        }
        set({
          activeMissionId: mission.id,
          currentStepId: mission.steps[0]?.id || null,
          missionProgress: 0,
          interactionHistory: [],
          isPaused: false,
          isCompleted: false,
          error: null,
        });
      },

      pauseMission: () => set({ isPaused: true }),
      resumeMission: () => set({ isPaused: false }),

      completeMission: () => set({ isCompleted: true, activeMissionId: null, currentStepId: null }),

      goToStep: (stepId: StepId) => {
        const { activeMissionId } = get();
        if (!activeMissionId) return;
        set({ currentStepId: stepId });
      },

      nextStep: () => {
        // This is a simple step progression, in a real app would likely need the full mission object
        // but for now, we'll assume the component manages the full mission object and calls goToStep
      },

      prevStep: () => {
        // Same as nextStep
      },

      updateField: (name, value, status = 'idle') => {
        const { fieldValues, fieldStates } = get();
        if (fieldValues[name] === value && fieldStates[name] === status) return;

        set((state) => ({
          fieldValues: { ...state.fieldValues, [name]: value },
          fieldStates: { ...state.fieldStates, [name]: status },
        }));
      },

      addInteraction: (stepId, actionText) => {
        set((state) => ({
          interactionHistory: [
            ...state.interactionHistory.filter(i => i.stepId !== stepId),
            { stepId, actionText, timestamp: Date.now() },
          ],
        }));
      },

      reset: () => set(initialState),

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'chalo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeMissionId: state.activeMissionId,
        currentStepId: state.currentStepId,
        fieldValues: state.fieldValues,
        interactionHistory: state.interactionHistory,
        isPaused: state.isPaused,
        isCompleted: state.isCompleted,
      }),
    }
  )
);
