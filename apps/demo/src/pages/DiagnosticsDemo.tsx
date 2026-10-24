import { useState, type FC } from 'react';
import { useChalo } from '@osiloke/chalo';
import { PortalDialog } from '../PortalDialog';
import {
  Sparkles,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';

export const DiagnosticsDemo: FC = () => {
  const [isPortalDialogOpen, setIsPortalDialogOpen] = useState(false);
  const [isReloadDemoModalOpen, setIsReloadDemoModalOpen] = useState(false);

  const {
    startMission,
    activeMission,
    currentStep,
    nextStep,
  } = useChalo();

  const handleOpenPortalDialog = () => {
    setIsPortalDialogOpen(true);
  };

  const handleClosePortalDialog = () => {
    setIsPortalDialogOpen(false);
    if (currentStep?.id === 'close-portal') {
      nextStep();
    }
  };

  const handleOpenReloadDemoModal = () => {
    setIsReloadDemoModalOpen(true);
    if (currentStep?.id === 'reload-open-modal') {
      nextStep();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Diagnostics & Verification</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Edge Case Sandbox</h1>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <button
            onClick={() => startMission('portal-dialog-demo')}
            disabled={activeMission?.id === 'portal-dialog-demo'}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-sm shadow-md hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>Portal Dialog Test</span>
          </button>
          <button
            onClick={() => startMission('action-engine-demo')}
            disabled={activeMission?.id === 'action-engine-demo'}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Activity size={16} />
            <span>Action Engine Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test 1: Portal Dialog Z-Index */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Portal Stacking Context Test</h3>
              <p className="text-xs text-slate-500">Simulates Radix UI / Headless UI dialogs with z-[9999]</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Dialogs rendered via React Portals into <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">document.body</code> previously obscured the SmartDrawer. With SmartDrawer\'s built-in portal rendering, the drawer remains reliably on top.
          </p>

          <button
            id="btn-open-portal"
            onClick={handleOpenPortalDialog}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-md active:scale-98 transition-all"
          >
            Open Portal Dialog (z-[9999])
          </button>
        </div>

        {/* Test 2: Page Reload Recovery */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-2xl">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Page Reload Re-execution</h3>
              <p className="text-xs text-slate-500">Test executeOnReload flag across page refreshes</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Actions marked with <code className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 font-mono text-orange-600">executeOnReload: true</code> automatically rerun upon refresh to restore necessary modal or navigation states.
          </p>

          <button
            id="btn-reload-demo"
            onClick={handleOpenReloadDemoModal}
            className="w-full py-3.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-md active:scale-98 transition-all"
          >
            Open Reload Demo Modal
          </button>
        </div>
      </div>

      {/* Target area for Action Engine test */}
      <div id="action-engine-target" className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity size={20} className="text-indigo-500" />
            <span>Action Engine Target Container</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-semibold">Ready for Automation</span>
        </div>
        <p className="text-xs text-slate-500">
          The Action Engine mission automatically scrolls to this container, verifies prerequisites, and fills the input below.
        </p>
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Automated Target Field</label>
          <input
            id="actionEngineInput"
            name="actionEngineInput"
            data-chalo-field="actionEngineInput"
            type="text"
            placeholder="Waiting for Action Engine sequence..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Target area for scroll test */}
      <div id="metrics-overview" className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Activity size={16} className="text-indigo-500" />
          <span>Scroll Target: Metrics Overview</span>
        </h4>
        <p className="text-xs text-slate-500">
          This container (#metrics-overview) is targeted by the middle step of the Scroll Mission.
        </p>
      </div>

      <div id="activity-feed" className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Scroll Target: Activity Feed</h4>
        <p className="text-xs text-slate-500">This anchor (#activity-feed) is targeted by the first step of the Scroll Mission.</p>
      </div>

      {/* Portal Dialog Component */}
      <PortalDialog
        isOpen={isPortalDialogOpen}
        onClose={handleClosePortalDialog}
        title="Portal Dialog Test"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            This dialog renders in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">document.body</code> with z-index <strong className="text-purple-600">z-[9999]</strong>.
          </p>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300">
            With SmartDrawer portal support enabled, the drawer floats comfortably above this dialog without stacking-context traps.
          </div>
          <button
            id="btn-close-portal"
            onClick={handleClosePortalDialog}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-lg transition-all"
          >
            Close Dialog
          </button>
        </div>
      </PortalDialog>

      {/* Reload Demo Modal */}
      {isReloadDemoModalOpen && (
        <div className="fixed inset-0 z-9998 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            data-reload-modal="true"
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-orange-500/20 space-y-4"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reload Demo Modal</h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              This modal reopens automatically after page reload when the action has <code className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 font-mono text-orange-600">executeOnReload: true</code>.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Field</label>
              <input
                name="reloadDemoField"
                type="text"
                placeholder="Type or use auto-fill..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
              />
            </div>
            <button
              onClick={() => setIsReloadDemoModalOpen(false)}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-lg transition-all"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
