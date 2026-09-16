import { Mission } from '@osiloke/chalo';

export const ONBOARDING_MISSION: Mission = {
  id: 'saas-onboarding',
  title: 'Welcome to Chalo Cloud',
  description: 'Quick walkthrough to get you started with your new cloud workspace.',
  steps: [
    {
      id: 'welcome',
      title: 'Greetings, Commander!',
      content: 'Let\'s get your flight parameters ready. First, we need to know who is at the helm of this workspace.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'profile-name',
      title: 'Define your ID',
      content: 'Enter your full name. This is how you will be recognized across the network.',
      targetField: 'fullName',
      bubbles: [
        { id: 'msg-1', type: 'message', content: 'You can type your name directly here in the guide, and it will sync to the form!' },
        { id: 'inp-1', type: 'input', targetField: 'fullName' },
        {
          id: 'act-1', type: 'action-group', actions: [
            { label: 'Auto-fill: Jane Quantum', type: 'fill_field', data: { field: 'fullName', value: 'Jane Quantum' } }
          ]
        }
      ]
    },
    {
      id: 'workspace-tier',
      title: 'Select your tier',
      content: 'Choose between "Standard" or "Enterprise" workspace tiers.',
      targetField: 'tier',
      bubbles: [
        { id: 'msg-2', type: 'message', content: 'Which tier suits your needs? Enterprise unlocks quantum encryption.' },
        {
          id: 'sel-1', type: 'select', targetField: 'tier', options: [
            { label: 'Standard Node', value: 'standard' },
            { label: 'Enterprise Cluster', value: 'enterprise' }
          ]
        },
        { id: 'msg-3', type: 'message', content: 'Click "Send" in the guide below once you have selected your tier.' }
      ]
    },
    {
      id: 'submit-data',
      title: 'Finalize Payload',
      content: 'Click the "Initialize Workspace" button to launch your project. All systems are green.',
      targetField: 'initialize_btn',
    },
    {
      id: 'complete-onboarding',
      title: 'Mission Success!',
      content: 'Your workspace is ready. You have successfully initialized your Chalo Cloud node.',
    }
  ]
};
