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

export type BubbleType = 'message' | 'input' | 'select' | 'action-group' | 'custom';

export interface Bubble {
  id: string;
  type: BubbleType;
  content?: string | ReactNode;
  targetField?: string; // Linked field for input/select
  options?: Array<{ label: string; value: unknown }>; // for select
  actions?: StepAction[]; // for action-group
}

export interface Step {
  id: StepId;
  title: string;
  content: string | ReactNode;
  bubbles?: Bubble[]; // Explicitly defined interactive bubbles
  targetField?: string; // name of the form field
  targetElement?: string; // CSS selector for non-form elements
  successCondition?: SuccessCondition;
  waitFor?: SuccessCondition; // If set, step waits until condition is met before allowing nextStep
  navigationRules?: {
    canGoBack?: boolean;
    canSkip?: boolean;
  };
  actions?: StepAction[];
}

export interface StepAction {
  label: string;
  type: 'next' | 'prev' | 'complete' | 'custom' | 'fill_field' | 'input_manual' | 'trigger_action';
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

export interface TourEntry {
  missionId: MissionId;
  lastStepId: StepId;
  completed: boolean;
  lastAccessed: number;
}

export interface ChaloState {
  activeMissionId: MissionId | null;
  currentStepId: StepId | null;
  missionProgress: number; // 0 to 100
  fieldValues: Record<string, unknown>;
  fieldStates: Record<string, 'idle' | 'focused' | 'valid' | 'invalid'>;
  missions: Record<string, Mission>;
  interactionHistory: ChatInteraction[];
  tourHistory: Record<string, TourEntry>;

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
  recordTourEntry: (missionId: MissionId, stepId: StepId, completed: boolean) => void;
  resetMission: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}
