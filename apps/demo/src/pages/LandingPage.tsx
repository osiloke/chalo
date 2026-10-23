import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChalo } from '@osiloke/chalo';
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Play,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LandingPage: FC = () => {
  const { startMission, activeMission } = useChalo();
  const navigate = useNavigate();

  const handleStartMission = (missionId: string, path: string) => {
    navigate(path);
    setTimeout(() => {
      startMission(missionId);
    }, 100);
  };

  const scenarios = [
    {
      title: 'SaaS Platform & Guided Onboarding',
      path: '/saas',
      badge: 'Product Walkthrough',
      description: 'Experience guided multi-step onboarding, form state synchronization with React Hook Form, and interactive dashboard exploration.',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-indigo-600',
      missions: [
        { id: 'saas-onboarding', label: 'Launch Onboarding Flow' },
        { id: 'dashboard-tutorial', label: 'Explore Dashboard Tour' },
      ],
      highlights: ['Zustand + React Hook Form binding', 'Step progress visualization', 'Interactive target element highlights'],
    },
    {
      title: 'Deep Form Workflows & Product Tours',
      path: '/forms',
      badge: 'Modal & Form Tours',
      description: 'See Chalo interact with real-world modal dialogs, auto-fill complex forms, and support plain uncontrolled/controlled inputs without form libraries.',
      icon: FileText,
      color: 'from-emerald-600 to-teal-600',
      missions: [
        { id: 'product-tour-create', label: 'Start Project Creation Tour' },
        { id: 'plain-inputs-demo', label: 'Plain HTML Inputs Tour' },
      ],
      highlights: ['Modal integration and element waiting', 'Dynamic value resolvers and auto-fills', 'Zero third-party form library lock-in'],
    },
    {
      title: 'Diagnostics, Portals & Action Engine',
      path: '/diagnostics',
      badge: 'Edge Cases & Engine',
      description: 'Test resilient UI automation: portal-mounted dialogs with high z-indices, automated multi-action execution chains, reload restoration, and smooth scroll.',
      icon: Wrench,
      color: 'from-purple-600 to-pink-600',
      missions: [
        { id: 'portal-dialog-demo', label: 'Run Portal Dialog Test' },
        { id: 'action-engine-demo', label: 'Run Action Engine Sequence' },
        { id: 'reload-demo', label: 'Test Page Reload Recovery' },
        { id: 'scroll-demo', label: 'Run Scroll Mission' },
      ],
      highlights: ['React Portal & stacking context escapes', 'Automated click, wait, and scroll sequences', 'executeOnReload state recovery'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Interactive Architectural Demo</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Intelligent Guided UI Experiences
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Explore how Chalo coordinates declarative missions, automated action sequences, and conversational UI drawers across distinct application scenarios.
        </p>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <div
              key={scenario.path}
              className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl overflow-hidden hover:border-indigo-500/40 hover:shadow-2xl transition-all group"
            >
              {/* Header Gradient */}
              <div className={`p-6 bg-linear-to-r ${scenario.color} text-white flex items-center justify-between`}>
                <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl">
                  <Icon size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">
                  {scenario.badge}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 pt-2">
                    {scenario.highlights.map((h, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    {scenario.missions.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleStartMission(m.id, scenario.path)}
                        disabled={activeMission?.id === m.id}
                        className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-all flex items-center justify-between disabled:opacity-50"
                      >
                        <span className="flex items-center space-x-2">
                          <Play size={12} fill="currentColor" />
                          <span>{m.label}</span>
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>

                  <Link
                    to={scenario.path}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <span>Enter Application View</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
