import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { useChalo } from '@osiloke/chalo';
import {
  Play,
  Grid,
  ShieldCheck,
  Terminal,
  Activity,
  Cpu,
  Server,
  Zap
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { cn } from '../lib/utils';

export const DashboardSaaSDemo: FC = () => {
  const form = useForm({
    defaultValues: {
      fullName: '',
      tier: 'standard',
    },
  });

  const [dataType, setDataType] = useState<'realtime' | 'snapshots'>('realtime');
  const {
    startMission,
    activeMission,
    currentStep,
    nextStep,
    registerField,
  } = useChalo({ form });

  const handleFormSubmit = form.handleSubmit((data) => {
    alert(`Workspace Initialized for: ${data.fullName} (${data.tier})`);
    if (activeMission?.id === 'saas-onboarding') nextStep();
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Title & Mission Launch Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">SaaS Cloud Architecture</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quantum Workspace Management</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => startMission('saas-onboarding')}
            disabled={activeMission?.id === 'saas-onboarding'}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Onboarding Tour</span>
          </button>
          <button
            onClick={() => startMission('dashboard-tutorial')}
            disabled={activeMission?.id === 'dashboard-tutorial'}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Grid size={16} />
            <span>Dashboard Mastery Tour</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Setup */}
        <div className="space-y-6">
          <section className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Terminal size={20} className="text-indigo-500" />
              <span>Initialize Node Form</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This form synchronizes dynamically with the Chalo SmartDrawer via React Hook Form.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className={cn("space-y-1.5", currentStep?.targetField === 'fullName' && "ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  {...registerField('fullName', { required: true })}
                  placeholder="e.g. John Quantum"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className={cn("space-y-1.5", currentStep?.targetField === 'tier' && "ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Tier</label>
                <select
                  {...registerField('tier')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                >
                  <option value="standard">Standard Node</option>
                  <option value="enterprise">Enterprise Cluster</option>
                </select>
              </div>

              <button
                type="submit"
                id="initialize_btn"
                className={cn(
                  "w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg",
                  currentStep?.targetField === 'initialize_btn' && "ring-4 ring-indigo-500 animate-bounce"
                )}
              >
                <ShieldCheck size={18} />
                <span>Initialize Workspace</span>
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: KPIs & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="kpi-cards">
            <DashboardCard
              title="Active Nodes"
              icon={Server}
              value="1,429"
              trend="14.2"
              color="bg-indigo-500 text-indigo-500"
              isHighlighted={currentStep?.id === 'kpi-cards'}
            />
            <DashboardCard
              title="Quantum Throughput"
              icon={Zap}
              value="892 TB/s"
              trend="28.4"
              color="bg-emerald-500 text-emerald-500"
              isHighlighted={currentStep?.id === 'kpi-cards'}
            />
            <DashboardCard
              title="CPU Cluster Health"
              icon={Cpu}
              value="99.98%"
              trend="0.4"
              color="bg-purple-500 text-purple-500"
              isHighlighted={currentStep?.id === 'kpi-cards'}
            />
          </div>

          {/* Chart & Filter Area */}
          <div id="chart-overview" className={cn("p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4", currentStep?.id === 'chart-overview' && "ring-2 ring-indigo-500")}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Throughput Analytics</h3>
                <p className="text-xs text-slate-500">Live aggregated telemetry across all active pods</p>
              </div>
              <div className="flex space-x-2" id="chart-filter">
                <button
                  onClick={() => setDataType('realtime')}
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-xl transition-all", dataType === 'realtime' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}
                >
                  Realtime
                </button>
                <button
                  onClick={() => setDataType('snapshots')}
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-xl transition-all", dataType === 'snapshots' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}
                >
                  Snapshots
                </button>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6">
              {[45, 60, 30, 80, 55, 95, 70, 85, 40, 65, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex flex-col justify-end">
                  <div
                    style={{ height: `${dataType === 'realtime' ? h : h * 0.75}%` }}
                    className="bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-xl"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div id="activity-stream" className={cn("p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3", currentStep?.id === 'activity-stream' && "ring-2 ring-indigo-500")}>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity size={16} className="text-indigo-500" />
              <span>Live System Log</span>
            </h4>
            <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span>[INFO] Cluster quantum handshake acknowledged</span>
                <span className="text-slate-400">0.4s ago</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span>[SYNC] Telemetry snapshot broadcast to node-04</span>
                <span className="text-slate-400">1.2s ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
