import { Mission } from '@osiloke/chalo';

export const PRODUCT_TOUR_MISSION: Mission = {
  id: 'product-tour-create',
  title: 'Create Your First Project',
  description: 'A guided walkthrough of the project creation flow.',
  allowCompletion: true,
  steps: [
    {
      id: 'tour-intro',
      title: 'Welcome to the Tour!',
      content: 'This tour will show you how to create a new project from start to finish. You\'ll interact with the real interface — not a simulation.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'find-create-btn',
      title: 'Find the Create Button',
      content: 'Look for the "Create Project" button in the Project Center. I\'ll click it for you to open the creation form.',
      targetElement: '#btn-create-project',
      executeOnReload: true,
      condition: {
        type: 'custom',
        predicate: () => !document.querySelector('[role="dialog"]'),
      },
      actionSequence: [
        {
          id: 'click-create',
          type: 'click',
          config: { selector: '#btn-create-project' },
          label: 'Open create modal',
          executeOnReload: true,
        },
      ],
      waitFor: {
        type: 'custom',
        predicate: () => !!document.querySelector('[role="dialog"]'),
      },
    },
    {
      id: 'modal-opened',
      title: 'Great! The Form is Open',
      content: 'This modal is where you configure your new project. All fields are real — try filling them in. I\'ll guide you through each one.',
      bubbles: [
        { id: 'msg-modal-1', type: 'message', content: 'Notice how the tour continues even though a modal is open. You can interact freely!' },
        {
          id: 'act-modal-1', type: 'action-group', actions: [
            { label: 'I\'ve looked around, continue', type: 'next' },
          ],
        },
      ],
    },
    {
      id: 'fill-project-name',
      title: 'Project Name',
      content: 'Every project needs a unique name. Type it here, in the modal, or use auto-fill below.',
      targetField: 'projectName',
      bubbles: [
        { id: 'inp-name', type: 'input', targetField: 'projectName' },
        {
          id: 'act-name', type: 'action-group', actions: [
            { label: 'Auto-fill: Project Nebula', type: 'fill_field', data: { field: 'projectName', value: 'Project Nebula' } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'projectName' },
    },
    {
      id: 'fill-region',
      title: 'Choose a Region',
      content: 'Select the deployment region closest to your users. Pick it in the chat, in the modal, or use auto-fill.',
      targetField: 'region',
      bubbles: [
        {
          id: 'sel-region', type: 'select', targetField: 'region',
          options: [
            { label: 'US East (N. Virginia)', value: 'us-east-1' },
            { label: 'US West (Oregon)', value: 'us-west-2' },
            { label: 'EU (Ireland)', value: 'eu-west-1' },
            { label: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
          ],
        },
        {
          id: 'act-region', type: 'action-group', actions: [
            { label: 'Auto-fill: EU (Ireland)', type: 'fill_field', data: { field: 'region', value: 'eu-west-1' } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'region' },
    },
    {
      id: 'fill-team-size',
      title: 'Set Team Size',
      content: 'How many collaborators will join this project? Enter it here, in the modal, or use auto-fill.',
      targetField: 'teamSize',
      bubbles: [
        { id: 'inp-team', type: 'input', targetField: 'teamSize' },
        {
          id: 'act-team', type: 'action-group', actions: [
            { label: 'Auto-fill: 5', type: 'fill_field', data: { field: 'teamSize', value: 5 } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'teamSize' },
    },
    {
      id: 'submit-project',
      title: 'Submit the Form',
      content: 'Click "Create Project" in the modal to submit. Or I can do it for you.',
      bubbles: [
        {
          id: 'act-submit', type: 'action-group', actions: [
            { label: 'Auto-fill description', type: 'fill_field', data: { field: 'description', value: 'A revolutionary cloud platform' } },
            { label: 'Submit for me', type: 'click', data: { field: 'submit-btn' } },
          ],
        },
      ],
      waitFor: { type: 'element_exists', field: 'submit-btn', exists: false },
    },
    {
      id: 'tour-complete',
      title: 'Tour Complete! 🎉',
      content: 'You\'ve successfully walked through the project creation flow. You can now create projects on your own. Feel free to explore other features!',
    },
  ],
};
