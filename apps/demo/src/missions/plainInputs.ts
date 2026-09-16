import { Mission } from '@osiloke/chalo';

export const PLAIN_INPUTS_MISSION: Mission = {
  id: 'plain-inputs-demo',
  title: 'Plain HTML Inputs (No RHF)',
  description: 'Demonstrates Chalo working with regular HTML inputs without react-hook-form.',
  allowCompletion: true,
  steps: [
    {
      id: 'plain-intro',
      title: 'Plain Inputs Demo',
      content: 'This section shows how Chalo works with regular HTML inputs — no react-hook-form required. The form below uses basic controlled components synced to the Chalo store.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'fill-server',
      title: 'Server Name',
      content: 'Enter a server name in the input below. You can type manually or use auto-fill.',
      targetField: 'serverName',
      bubbles: [
        { id: 'inp-server', type: 'input', targetField: 'serverName' },
        {
          id: 'act-server', type: 'action-group', actions: [
            { label: 'Auto-fill: prod-server-01', type: 'fill_field', data: { field: 'serverName', value: 'prod-server-01' } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'serverName' },
    },
    {
      id: 'fill-region-plain',
      title: 'Select Region',
      content: 'Choose a deployment region from the dropdown.',
      targetField: 'deployRegion',
      bubbles: [
        {
          id: 'sel-plain-region', type: 'select', targetField: 'deployRegion',
          options: [
            { label: 'US East', value: 'us-east' },
            { label: 'EU West', value: 'eu-west' },
            { label: 'Asia Pacific', value: 'ap-south' },
          ],
        },
        {
          id: 'act-plain-region', type: 'action-group', actions: [
            { label: 'Auto-fill: EU West', type: 'fill_field', data: { field: 'deployRegion', value: 'eu-west' } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'deployRegion' },
    },
    {
      id: 'fill-cores',
      title: 'CPU Cores',
      content: 'Set the number of CPU cores for this deployment.',
      targetField: 'cpuCores',
      bubbles: [
        { id: 'inp-cores', type: 'input', targetField: 'cpuCores' },
        {
          id: 'act-cores', type: 'action-group', actions: [
            { label: 'Auto-fill: 8', type: 'fill_field', data: { field: 'cpuCores', value: 8 } },
          ],
        },
      ],
      waitFor: { type: 'field_touched', field: 'cpuCores' },
    },
    {
      id: 'submit-plain',
      title: 'Deploy Server',
      content: 'Click "Deploy Server" to submit. The values are tracked in the Chalo store even without react-hook-form.',
      targetField: 'deploy-btn',
      bubbles: [
        {
          id: 'act-deploy', type: 'action-group', actions: [
            { label: 'Deploy for me', type: 'click', data: { field: 'deploy-btn' } },
          ],
        },
      ],
      waitFor: { type: 'custom', predicate: () => !!document.querySelector('#deploy-status') },
    },
    {
      id: 'plain-complete',
      title: 'Plain Inputs Complete! 🎉',
      content: 'You\'ve successfully used Chalo with plain HTML inputs. The store tracked all your values without any form library!',
    },
  ],
};
