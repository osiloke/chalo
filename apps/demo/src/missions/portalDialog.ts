import { Mission } from '@osiloke/chalo';

export const PORTAL_DIALOG_MISSION: Mission = {
  id: 'portal-dialog-demo',
  title: 'Portal Dialog Test',
  description: 'Tests SmartDrawer z-index and portal behavior with portal-based dialogs',
  allowCompletion: true,
  steps: [
    {
      id: 'portal-intro',
      title: 'Portal Dialog Test',
      content: 'This test demonstrates the z-index and stacking context behavior when dialogs use portals. We\'ll open a portal dialog and verify SmartDrawer stays on top.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'open-portal-dialog',
      title: 'Open Portal Dialog',
      content: 'Click the button below to open a portal-based dialog with high z-index. The SmartDrawer should remain visible above it.',
      targetElement: '#btn-open-portal',
      actionSequence: [
        {
          id: 'click-portal',
          type: 'click',
          config: { selector: '#btn-open-portal' },
          label: 'Open portal dialog',
        },
      ],
      waitFor: {
        type: 'custom',
        predicate: () => !!document.getElementById('portal-dialog-root'),
      },
    },
    {
      id: 'portal-opened',
      title: 'Dialog is Open',
      content: 'The portal dialog is now open with z-[9999]. The SmartDrawer renders in document.body with z-[10000] and stays directly above it!',
      bubbles: [
        { id: 'msg-portal-1', type: 'message', content: 'Can you see me? The SmartDrawer is now safely rendering ABOVE this portal dialog thanks to React Portals!' },
        {
          id: 'act-portal-1', type: 'action-group', actions: [
            { label: 'I can see the drawer clearly', type: 'next' },
          ],
        },
      ],
    },
    {
      id: 'close-portal',
      title: 'Close the Dialog',
      content: 'Now let\'s close the portal dialog and finish the test.',
      actionSequence: [
        {
          id: 'close-portal-dialog',
          type: 'click',
          config: { selector: '#btn-close-portal' },
          label: 'Close portal dialog',
        },
      ],
      waitFor: {
        type: 'custom',
        predicate: () => !document.getElementById('portal-dialog-root'),
      },
    },
    {
      id: 'portal-complete',
      title: 'Test Complete! 🎉',
      content: 'You\'ve verified portal dialog integration. SmartDrawer successfully overlays portal-mounted UI components.',
    },
  ],
};
