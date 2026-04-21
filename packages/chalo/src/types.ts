import { ReactNode } from 'react';

export type MissionId = string;
export type StepId = string;

// --- ACTION EXECUTION ENGINE TYPES ---

export type ActionType =
  | 'click'
  | 'scroll'
  | 'fill_field'
  | 'api_call'
  | 'wait'
  | 'conditional'
  | 'navigate'
  | 'custom';

export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped';

export interface RetryConfig {
  maxAttempts: number;
  backoff: 'fixed' | 'exponential';
  delayMs: number;
}

export interface RollbackConfig {
  enabled: boolean;
}

// Type-specific action configs
export interface ClickActionConfig {
  /** CSS selector to find the element */
  selector?: string;
  /** Named element registered via `registerElement` (preferred over `selector`) */
  field?: string;
}

export interface ScrollActionConfig {
  /** CSS selector to find the element */
  selector?: string; // element to scroll to; if omitted, scrolls to bottom
  /** Named element registered via `registerElement` or `registerField` (preferred over `selector`) */
  field?: string;
  behavior?: 'auto' | 'smooth' | 'instant';
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

export type FieldValueSource =
  | { type: 'literal'; value: unknown }
  | { type: 'ref'; field: string }
  | { type: 'fn'; generator: () => unknown };

export interface FillFieldActionConfig {
  field: string;
  /**
   * Value to fill. Can be:
   * - A literal value (string, number, etc.)
   * - A FieldValueSource object for dynamic resolution
   *
   * Examples:
   *   value: "static text"                              // literal
   *   value: { type: 'ref', field: 'password' }         // reference another field
   *   value: { type: 'fn', generator: () => uuid() }    // function-generated
   */
  value: unknown | FieldValueSource;
}

export interface ApiCallActionConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

export interface WaitActionConfig {
  durationMs: number;
}

export interface ConditionalActionConfig {
  condition: SuccessCondition;
  thenActions?: string[]; // action IDs
  elseActions?: string[]; // action IDs
}

export interface NavigateActionConfig {
  path: string;
}

export interface CustomActionConfig {
  handlerId: string;
  params?: Record<string, unknown>;
}

export type ActionConfig =
  | ClickActionConfig
  | ScrollActionConfig
  | FillFieldActionConfig
  | ApiCallActionConfig
  | WaitActionConfig
  | ConditionalActionConfig
  | NavigateActionConfig
  | CustomActionConfig;

export interface Action {
  id: string;
  type: ActionType;
  config: ActionConfig;
  label?: string; // Human-readable description
  retry?: RetryConfig;
  rollback?: RollbackConfig;
  dependsOn?: string[]; // action IDs that must complete first
  condition?: SuccessCondition; // skip if condition not met
  /**
   * When true, this action will execute on page reload even if
   * conditions are not met or it was previously executed.
   * Use for actions that restore critical UI state (e.g., opening modals).
   * @default false
   */
  executeOnReload?: boolean;
}

export interface ActionResult {
  id: string;
  status: ActionStatus;
  data?: unknown;
  error?: string;
  attempts: number;
  startedAt?: number;
  completedAt?: number;
}

export interface ExecutionContext {
  results: Record<string, ActionResult>;
  variables: Record<string, unknown>;
  isRunning: boolean;
  currentActionId: string | null;
  /** Optional callback to sync field values with the store/form (set by store before execution) */
  updateField?: (name: string, value: unknown, status?: 'idle' | 'focused' | 'valid' | 'invalid') => void;
}

// Handler function signature for custom actions
export type ActionHandler = (config: ActionConfig, context: ExecutionContext) => Promise<unknown>;

// --- MISSION & STEP TYPES ---

export interface Mission {
  id: MissionId;
  title: string;
  description?: string;
  steps: Step[];
  metadata?: Record<string, unknown>;
  onComplete?: () => void;
  allowCompletion?: boolean; // If true, the mission can be marked as completed and stored
  actions?: Action[]; // Mission-level action sequences
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
  condition?: SuccessCondition; // Gates auto-execution of actionSequence; if not met, sequence is skipped
  navigationRules?: {
    canGoBack?: boolean;
    canSkip?: boolean;
  };
  actions?: StepAction[];
  actionSequence?: Action[]; // Engine-driven action sequence for this step
  /**
   * When true, the actionSequence will re-execute on page reload
   * regardless of execution history or condition checks.
   * @default false
   */
  executeOnReload?: boolean;
}

export interface StepAction {
  label: string;
  type: 'next' | 'prev' | 'complete' | 'custom' | 'fill_field' | 'input_manual' | 'trigger_action' | 'click';
  data?: unknown;
  onClick?: () => void;
}

export interface SuccessCondition {
  type: 'field_value' | 'field_touched' | 'element_exists' | 'custom';
  field?: string;
  value?: unknown;
  exists?: boolean; // for element_exists type: true (default) or false
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
  completedMissions: MissionId[]; // Persisted list of completed mission IDs
  executionContext: ExecutionContext;

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
  markMissionCompleted: (missionId: MissionId) => void;
  registerActionHandler: (type: ActionType, handler: ActionHandler) => void;
  executeAction: (action: Action) => Promise<ActionResult>;
  executeActionSequence: (actions: Action[], stepId?: string) => Promise<Record<string, ActionResult>>;
  cancelExecution: () => void;
  dismissAllTours: () => void;
  resetMission: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
  recordExecutedStep: (missionId: MissionId, stepId: StepId) => void;
  clearExecutedSteps: (missionId: MissionId) => void;
}
