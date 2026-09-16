import { Mission } from '@osiloke/chalo';

export const DASHBOARD_TUTORIAL: Mission = {
  id: 'dashboard-tutorial',
  title: 'Dashboard Mastery',
  description: 'Learn how to interpret your real-time analytics and data streams.',
  steps: [
    {
      id: 'kpi-cards',
      title: 'Key Performance Indicators',
      content: 'These top cards give a snapshot of system health. You triggered this by exploring the dashboard!',
    },
    {
      id: 'chart-filter',
      title: 'Interactive Filters',
      content: 'You can change how data is displayed. Try clicking on "Snapshots" right now!',
    },
    {
      id: 'chart-overview',
      title: 'Quantum Analytics',
      content: 'This chart displays your data throughput based on your filter selection.',
    },
    {
      id: 'activity-stream',
      title: 'Active Node Monitoring',
      content: 'Here you see live logs. Notice how the tutorial highlights exactly what you should look at.',
    },
    {
      id: 'final-tutorial',
      title: 'You are ready',
      content: 'You have mastered the dashboard. You can interact with data directly and learn simultaneously!',
    }
  ]
};
