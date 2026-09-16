import { Mission, Action } from '@osiloke/chalo';

export const ACTION_ENGINE_DEMO_ACTIONS: Action[] = [
  {
    id: 'scroll-to-target',
    type: 'scroll',
    config: { selector: '#action-engine-target', behavior: 'smooth' },
    label: 'Scroll to target container',
  },
  {
    id: 'wait-for-render',
    type: 'wait',
    config: { durationMs: 800 },
    label: 'Wait for verification',
    dependsOn: ['scroll-to-target'],
  },
  {
    id: 'fill-name',
    type: 'fill_field',
    config: { field: 'actionEngineInput', value: 'Action Engine Automated Agent' },
    label: 'Fill target input',
    dependsOn: ['wait-for-render'],
  },
];

export const ACTION_ENGINE_MISSION: Mission = {
  id: 'action-engine-demo',
  title: 'Action Engine Demo',
  description: 'Demonstrates the action execution engine with scroll, wait, and fill_field.',
  allowCompletion: true,
  steps: [
    {
      id: 'ae-intro',
      title: 'Action Engine',
      content: 'This demo shows the action execution engine. Actions execute automatically in dependency sequence: scroll, wait, then fill.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'ae-execute',
      title: 'Executing Actions',
      content: 'Watch the action execution status below. Each action runs with live progress reporting.',
      actionSequence: ACTION_ENGINE_DEMO_ACTIONS,
    },
    {
      id: 'ae-complete',
      title: 'Actions Complete',
      content: 'All actions executed successfully. The engine supports retry, cancellation, and dependency resolution.',
    },
  ],
};
