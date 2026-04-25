import { describe, it, expect, beforeEach } from 'vitest';
import { useChaloStore } from './store';

describe('chalo store', () => {
  beforeEach(() => {
    useChaloStore.getState().reset();
  });

  it('initializes with default state', () => {
    const state = useChaloStore.getState();
    expect(state.activeMissionId).toBeNull();
    expect(state.currentStepId).toBeNull();
    expect(state.isPaused).toBe(false);
    expect(state.isCompleted).toBe(false);
    expect(state.error).toBeNull();
    expect(state.fieldValues).toEqual({});
  });

  it('registers a mission', () => {
    const mission = {
      id: 'test-mission',
      title: 'Test',
      steps: [{ id: 'step-1', title: 'Step 1', content: 'Hello' }],
      allowCompletion: true,
    };
    useChaloStore.getState().registerMission(mission);
    expect(useChaloStore.getState().missions['test-mission']).toBeDefined();
  });

  it('starts a mission', () => {
    const mission = {
      id: 'start-test',
      title: 'Start Test',
      steps: [{ id: 'first-step', title: 'First', content: 'Go' }],
    };
    useChaloStore.getState().registerMission(mission);
    useChaloStore.getState().startMission('start-test');
    const state = useChaloStore.getState();
    expect(state.activeMissionId).toBe('start-test');
    expect(state.currentStepId).toBe('first-step');
  });

  it('updates fields', () => {
    useChaloStore.getState().updateField('username', 'alice');
    expect(useChaloStore.getState().fieldValues['username']).toBe('alice');
  });

  it('marks mission as completed when allowCompletion is true', () => {
    const mission = {
      id: 'completable',
      title: 'Completable Mission',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
      allowCompletion: true,
    };
    useChaloStore.getState().registerMission(mission);
    useChaloStore.getState().markMissionCompleted('completable');
    expect(useChaloStore.getState().completedMissions).toContain('completable');
  });

  it('deregisters a mission', () => {
    const mission = {
      id: 'remove-me',
      title: 'Remove Me',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
    };
    useChaloStore.getState().registerMission(mission);
    expect(useChaloStore.getState().missions['remove-me']).toBeDefined();

    useChaloStore.getState().deregisterMission('remove-me');
    expect(useChaloStore.getState().missions['remove-me']).toBeUndefined();
  });

  it('resets active mission state when deregistering an active mission', () => {
    const mission = {
      id: 'active-to-remove',
      title: 'Active To Remove',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
    };
    useChaloStore.getState().registerMission(mission);
    useChaloStore.getState().startMission('active-to-remove');
    expect(useChaloStore.getState().activeMissionId).toBe('active-to-remove');

    useChaloStore.getState().deregisterMission('active-to-remove');
    const state = useChaloStore.getState();
    expect(state.missions['active-to-remove']).toBeUndefined();
    expect(state.activeMissionId).toBeNull();
    expect(state.currentStepId).toBeNull();
  });
});
