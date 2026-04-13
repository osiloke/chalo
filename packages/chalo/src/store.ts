import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChaloStore, Mission, MissionId, StepId, ChaloState, Action, ActionType, ActionHandler } from './types';
import { actionEngine } from './engine';

const initialState: ChaloState = {
  activeMissionId: null,
  currentStepId: null,
  missionProgress: 0,
  fieldValues: {},
  fieldStates: {},
  missions: {},
  interactionHistory: [],
  tourHistory: {},
  completedMissions: [],
  executionContext: {
    results: {},
    variables: {},
    isRunning: false,
    currentActionId: null,
  },
  isPaused: false,
  isCompleted: false,
  error: null,
};

export const useChaloStore = create<ChaloStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Extended state for persistence
      executedSteps: {} as Record<string, string[]>,

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
          fieldValues: {},
          fieldStates: {},
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

      recordTourEntry: (missionId, stepId, completed) => {
        set((state) => ({
          tourHistory: {
            ...state.tourHistory,
            [missionId]: {
              missionId,
              lastStepId: stepId,
              completed,
              lastAccessed: Date.now(),
            },
          },
        }));
      },

      resetMission: () => {
        set({
          activeMissionId: null,
          currentStepId: null,
          missionProgress: 0,
          fieldValues: {},
          fieldStates: {},
          interactionHistory: [],
          executionContext: {
            results: {},
            variables: {},
            isRunning: false,
            currentActionId: null,
          },
          isPaused: false,
          isCompleted: false,
          error: null,
          // Preserve: missions, tourHistory
        });
      },

      dismissAllTours: () => {
        set((state) => ({
          tourHistory: Object.fromEntries(
            Object.entries(state.tourHistory).map(([id, entry]) => [id, { ...entry, completed: true }])
          ),
        }));
      },

      markMissionCompleted: (missionId: MissionId) => {
        const { missions } = get();
        const mission = missions[missionId];
        // Only allow marking if the mission explicitly allows completion
        if (!mission?.allowCompletion) {
          console.warn(`Mission "${missionId}" does not allow completion. Set allowCompletion: true on the mission.`);
          return;
        }
        set((state) => ({
          completedMissions: state.completedMissions.includes(missionId)
            ? state.completedMissions
            : [...state.completedMissions, missionId],
        }));
      },

      registerActionHandler: (type: ActionType, handler: ActionHandler) => {
        actionEngine.registerHandler(type, handler);
      },

      executeAction: async (action: Action) => {
        const { executionContext } = get();
        set((state) => ({
          executionContext: { ...state.executionContext, isRunning: true },
        }));
        const result = await actionEngine.executeAction(action, executionContext);
        set((state) => ({
          executionContext: { ...state.executionContext, ...executionContext, isRunning: false },
        }));
        return result;
      },

      executeActionSequence: async (actions: Action[], stepId?: string) => {
        const { executionContext, addInteraction, updateField } = get();
        // Reset context for new sequence
        executionContext.results = {};
        executionContext.variables = {};
        executionContext.isRunning = true;
        executionContext.updateField = updateField;
        set((state) => ({
          executionContext: { ...state.executionContext, ...executionContext },
        }));

        const results = await actionEngine.executeSequence(actions, executionContext, (results) => {
          set((state) => ({
            executionContext: { ...state.executionContext, results, isRunning: true },
          }));
          // Report progress to interaction history
          if (stepId) {
            const completed = Object.values(results).filter((r) => r.status === 'success').length;
            addInteraction(stepId, `Action progress: ${completed}/${actions.length} completed`);
          }
        });

        set((state) => ({
          executionContext: { ...state.executionContext, results, isRunning: false, currentActionId: null },
        }));
        return results;
      },

      cancelExecution: () => {
        actionEngine.cancel();
        set((state) => ({
          executionContext: { ...state.executionContext, isRunning: false, currentActionId: null },
        }));
      },

      reset: () => set(initialState),

      setError: (error: string | null) => set({ error }),

      // Helper to record that a step's actions were executed
      recordExecutedStep: (missionId: MissionId, stepId: StepId) => {
        set((state) => {
          const executedSteps = (state as any).executedSteps || {};
          const missionExecuted = executedSteps[missionId] || [];
          if (!missionExecuted.includes(stepId)) {
            return {
              executedSteps: {
                ...executedSteps,
                [missionId]: [...missionExecuted, stepId],
              },
            } as any;
          }
          return {} as any;
        });
      },

      // Helper to clear executed steps for a mission
      clearExecutedSteps: (missionId: MissionId) => {
        set((state) => ({
          executedSteps: {
            ...((state as any).executedSteps || {}),
            [missionId]: [],
          },
        } as any));
      },
    }),
    {
      name: 'chalo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeMissionId: state.activeMissionId,
        currentStepId: state.currentStepId,
        fieldValues: state.fieldValues,
        interactionHistory: state.interactionHistory,
        tourHistory: state.tourHistory,
        completedMissions: state.completedMissions,
        isPaused: state.isPaused,
        isCompleted: state.isCompleted,
        executedSteps: (state as any).executedSteps || {},
      }),
    }
  )
);
