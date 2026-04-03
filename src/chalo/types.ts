import { ReactNode } from 'react';

export type MissionId = string;
export type StepId = string;

export interface Mission {
  id: MissionId;
  title: string;
  description?: string;
  steps: Step[];
  metadata?: Record<string, unknown>;
  onComplete?: () => void;
}

export interface Step {
  id: StepId;
  title: string;
  content: string | ReactNode;
  targetField?: string; // name of the form field
  targetElement?: string; // CSS selector for non-form elements
  successCondition?: SuccessCondition;
  navigationRules?: {
    canGoBack?: boolean;
    canSkip?: boolean;
  };
  actions?: StepAction[];
}

export interface StepAction {
  label: string;
  type: 'next' | 'prev' | 'complete' | 'custom' | 'fill_field';
  data?: unknown;
  onClick?: () => void;
}

export interface SuccessCondition {
  type: 'field_value' | 'field_touched' | 'custom';
  field?: string;
  value?: unknown;
  predicate?: (value: unknown, formState: unknown) => boolean;
}

export interface ChatInteraction {
  stepId: string;
  actionText: string;
  timestamp: number;
}

export interface ChaloState {
  activeMissionId: MissionId | null;
  currentStepId: StepId | null;
  missionProgress: number; // 0 to 100
  fieldValues: Record<string, unknown>;
  fieldStates: Record<string, 'idle' | 'focused' | 'valid' | 'invalid'>;
  missions: Record<string, Mission>;
  interactionHistory: ChatInteraction[];

  isPaused: boolean;
  isCompleted: boolean;
  error: string | null;
}

export interface ChaloStore extends ChaloState {
  registerMission: (mission: Mission) => void;
  startMission: (missionId: MissionId) => void;
  pauseMission: () => void;
  resumeMission: () => void;
  completeMission: () => void;
  goToStep: (stepId: StepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (name: string, value: unknown, status?: ChaloState['fieldStates'][string]) => void;
  addInteraction: (stepId: string, actionText: string) => void;
  reset: () => void;
  setError: (error: string | null) => void;
}
