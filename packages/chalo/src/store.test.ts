import { describe, it, expect, beforeEach } from 'vitest'
import { useChaloStore } from './store'

describe('chalo store', () => {
  beforeEach(() => {
    useChaloStore.getState().reset()
  })

  it('initializes with default state', () => {
    const state = useChaloStore.getState()
    expect(state.activeMissionId).toBeNull()
    expect(state.currentStepId).toBeNull()
    expect(state.isPaused).toBe(false)
    expect(state.isCompleted).toBe(false)
    expect(state.error).toBeNull()
    expect(state.fieldValues).toEqual({})
  })

  it('registers a mission', () => {
    const mission = {
      id: 'test-mission',
      title: 'Test',
      steps: [{ id: 'step-1', title: 'Step 1', content: 'Hello' }],
      allowCompletion: true,
    }
    useChaloStore.getState().registerMission(mission)
    expect(useChaloStore.getState().missions['test-mission']).toBeDefined()
  })

  it('starts a mission', () => {
    const mission = {
      id: 'start-test',
      title: 'Start Test',
      steps: [{ id: 'first-step', title: 'First', content: 'Go' }],
    }
    useChaloStore.getState().registerMission(mission)
    useChaloStore.getState().startMission('start-test')
    const state = useChaloStore.getState()
    expect(state.activeMissionId).toBe('start-test')
    expect(state.currentStepId).toBe('first-step')
  })

  it('updates fields', () => {
    useChaloStore.getState().updateField('username', 'alice')
    expect(useChaloStore.getState().fieldValues['username']).toBe('alice')
  })

  it('marks mission as completed when allowCompletion is true', () => {
    const mission = {
      id: 'completable',
      title: 'Completable Mission',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
      allowCompletion: true,
    }
    useChaloStore.getState().registerMission(mission)
    useChaloStore.getState().markMissionCompleted('completable')
    expect(useChaloStore.getState().completedMissions).toContain('completable')
  })

  it('deregisters a mission', () => {
    const mission = {
      id: 'remove-me',
      title: 'Remove Me',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
    }
    useChaloStore.getState().registerMission(mission)
    expect(useChaloStore.getState().missions['remove-me']).toBeDefined()

    useChaloStore.getState().deregisterMission('remove-me')
    expect(useChaloStore.getState().missions['remove-me']).toBeUndefined()
  })

  it('resets active mission state when deregistering an active mission', () => {
    const mission = {
      id: 'active-to-remove',
      title: 'Active To Remove',
      steps: [{ id: 's1', title: 'S1', content: 'Test' }],
    }
    useChaloStore.getState().registerMission(mission)
    useChaloStore.getState().startMission('active-to-remove')
    expect(useChaloStore.getState().activeMissionId).toBe('active-to-remove')

    useChaloStore.getState().deregisterMission('active-to-remove')
    const state = useChaloStore.getState()
    expect(state.missions['active-to-remove']).toBeUndefined()
    expect(state.activeMissionId).toBeNull()
    expect(state.currentStepId).toBeNull()
  })

  it('completes a mission, invokes onComplete, and records to completedMissions', () => {
    let completedCallbackCalled = false
    const mission = {
      id: 'completion-flow',
      title: 'Completion Flow',
      steps: [{ id: 'step-done', title: 'Done', content: 'Done' }],
      allowCompletion: true,
      onComplete: () => {
        completedCallbackCalled = true
      },
    }
    useChaloStore.getState().registerMission(mission)
    useChaloStore.getState().startMission('completion-flow')
    expect(useChaloStore.getState().activeMissionId).toBe('completion-flow')

    useChaloStore.getState().completeMission()
    const state = useChaloStore.getState()
    expect(state.isCompleted).toBe(true)
    expect(state.activeMissionId).toBeNull()
    expect(state.currentStepId).toBeNull()
    expect(state.completedMissions).toContain('completion-flow')
    expect(completedCallbackCalled).toBe(true)
  })

  it('switches to a new mission cleanly after previous mission completion', () => {
    const m1 = {
      id: 'm1',
      title: 'M1',
      steps: [{ id: 'm1-s1', title: 'S1', content: 'C1' }],
      allowCompletion: true,
    }
    const m2 = {
      id: 'm2',
      title: 'M2',
      steps: [{ id: 'm2-s1', title: 'S2', content: 'C2' }],
      allowCompletion: true,
    }
    useChaloStore.getState().registerMission(m1)
    useChaloStore.getState().registerMission(m2)

    useChaloStore.getState().startMission('m1')
    expect(useChaloStore.getState().activeMissionId).toBe('m1')

    useChaloStore.getState().completeMission()
    expect(useChaloStore.getState().isCompleted).toBe(true)
    expect(useChaloStore.getState().activeMissionId).toBeNull()

    // Now start m2
    useChaloStore.getState().startMission('m2')
    const state = useChaloStore.getState()
    expect(state.activeMissionId).toBe('m2')
    expect(state.currentStepId).toBe('m2-s1')
    expect(state.isCompleted).toBe(false)
    expect(state.executionContext.isRunning).toBe(false)
  })
})
