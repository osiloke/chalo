import { Mission } from '@osiloke/chalo';

export const SCROLL_MISSION: Mission = {
  id: 'scroll-demo',
  title: 'Scroll Mission Demo',
  description: 'Demonstrates the scroll action with various targets across the application.',
  allowCompletion: true,
  steps: [
    {
      id: 'scroll-intro',
      title: 'Scroll Actions',
      content: 'This mission shows how scroll actions automatically navigate to elements anywhere on the page.',
      navigationRules: { canGoBack: false },
      actionSequence: [
        {
          id: 'scroll-activity',
          type: 'scroll',
          config: { selector: '#activity-feed', behavior: 'smooth' },
          label: 'Scroll to Activity Stream',
        },
      ],
    },
    {
      id: 'scroll-chart',
      title: 'Scroll to Metrics',
      content: 'Watch as we automatically scroll to the metrics overview section.',
      actionSequence: [
        {
          id: 'scroll-to-chart',
          type: 'scroll',
          config: { selector: '#metrics-overview', behavior: 'smooth' },
          label: 'Scroll to chart',
        },
        {
          id: 'wait-chart',
          type: 'wait',
          config: { durationMs: 500 },
          label: 'Wait for scroll',
          dependsOn: ['scroll-to-chart'],
        },
      ],
    },
    {
      id: 'scroll-bottom',
      title: 'Scroll to Bottom',
      content: 'Finally, scroll all the way to the bottom of the page without a specific target.',
      actionSequence: [
        {
          id: 'scroll-bottom',
          type: 'scroll',
          config: { behavior: 'smooth' },
          label: 'Scroll to page bottom',
        },
      ],
    },
    {
      id: 'scroll-complete',
      title: 'Scroll Complete! 🎉',
      content: 'You\'ve seen how scroll actions can navigate smoothly to any element on the page.',
    },
  ],
};
