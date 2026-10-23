import { Mission } from '@osiloke/chalo';

export const RELOAD_DEMO_MISSION: Mission = {
  id: 'reload-demo',
  title: 'Page Reload Demo',
  description: 'Demonstrates action re-execution on page reload to restore UI state',
  allowCompletion: true,
  steps: [
    {
      id: 'reload-intro',
      title: 'Reload Behavior Demo',
      content: 'This mission demonstrates how actions can re-execute on page reload to restore UI state. Try refreshing the page at any step!',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'reload-open-modal',
      title: 'Open Configuration Modal',
      content: 'I\'ll open a modal for you. If you refresh the page, I\'ll open it again automatically!',
      targetElement: '#btn-reload-demo',
      executeOnReload: true,
      actionSequence: [
        {
          id: 'click-reload-btn',
          type: 'click',
          config: { selector: '#btn-reload-demo' },
          label: 'Open reload demo modal',
          executeOnReload: true,
        },
      ],
      waitFor: {
        type: 'custom',
        predicate: () => !!document.querySelector('[data-reload-modal="true"]'),
      },
    },
    {
      id: 'reload-modal-open',
      title: 'Modal Restored!',
      content: 'The modal reopened automatically after reload. This is powered by the executeOnReload flag. Try filling the form below!',
      targetField: 'reloadDemoField',
      bubbles: [
        { id: 'msg-reload-1', type: 'message', content: 'Notice how the modal reopened? That\'s the executeOnReload flag in action!' },
        {
          id: 'act-reload-1', type: 'action-group', actions: [
            { label: 'Continue to form fill', type: 'next' },
          ],
        },
      ],
    },
    {
      id: 'reload-fill-field',
      title: 'Auto-fill Field',
      content: 'Now I\'ll fill this field for you. This action won\'t re-execute on reload unless you mark it.',
      targetField: 'reloadDemoField',
      bubbles: [
        { id: 'inp-reload-field', type: 'input', targetField: 'reloadDemoField' },
        {
          id: 'act-reload-fill', type: 'action-group', actions: [
            { label: 'Auto-fill: Reload Test Value', type: 'fill_field', data: { field: 'reloadDemoField', value: 'Restored after reload!' } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'reloadDemoField' },
    },
    {
      id: 'reload-complete',
      title: 'Reload Demo Complete! 🎉',
      content: 'You\'ve seen how executeOnReload works. Actions marked with this flag re-execute on page reload to restore critical UI state.',
    },
  ],
};
