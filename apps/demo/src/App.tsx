import { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  SmartDrawer,
  useChalo,
  Mission,
  Action,
} from '@osiloke/chalo';
import { CreateProjectModal, type CreateProjectFormData } from './CreateProjectModal';
import {
  LayoutDashboard,
  Users,
  Bell,
  Sparkles,
  Play,
  ChevronRight,
  ShieldCheck,
  CircleDashed,
  MoreVertical,
  Activity,
  Terminal,
  Grid,
  Search,
  FolderPlus,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MISSION SCHEMAS ---

const ONBOARDING_MISSION: Mission = {
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

const DASHBOARD_TUTORIAL: Mission = {
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

const PRODUCT_TOUR_MISSION: Mission = {
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
      content: 'Look for the "Create Project" button in the Mission Center. I\'ll click it for you to open the creation form.',
      targetElement: '#btn-create-project',
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

// Action sequence for the action engine demo
const ACTION_ENGINE_DEMO_ACTIONS: Action[] = [
  {
    id: 'scroll-to-form',
    type: 'scroll',
    config: { field: 'fullName', behavior: 'smooth' },
    label: 'Scroll to name field',
  },
  {
    id: 'wait-for-render',
    type: 'wait',
    config: { durationMs: 800 },
    label: 'Wait for render',
    dependsOn: ['scroll-to-form'],
  },
  {
    id: 'fill-name',
    type: 'fill_field',
    config: { field: 'fullName', value: 'Action Engine Demo' },
    label: 'Fill name field',
    dependsOn: ['wait-for-render'],
  },
];

const ACTION_ENGINE_MISSION: Mission = {
  id: 'action-engine-demo',
  title: 'Action Engine Demo',
  description: 'Demonstrates the action execution engine with scroll, wait, and fill_field.',
  allowCompletion: true,
  steps: [
    {
      id: 'ae-intro',
      title: 'Action Engine',
      content: 'This demo shows the action execution engine. Actions will execute automatically: scroll, wait, then fill the form field.',
      navigationRules: { canGoBack: false },
    },
    {
      id: 'ae-execute',
      title: 'Executing Actions',
      content: 'Watch the action execution status below. Each action runs with progress reporting.',
      actionSequence: ACTION_ENGINE_DEMO_ACTIONS,
    },
    {
      id: 'ae-complete',
      title: 'Actions Complete',
      content: 'All actions executed successfully. The engine supports retry, cancellation, and dependency resolution.',
    },
  ],
};

// --- COMPONENTS ---

interface DashboardCardProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  trend: string;
  color: string;
  isHighlighted?: boolean;
  onHover?: () => void;
}

const DashboardCard = ({ title, icon: Icon, value, trend, color, isHighlighted, onHover }: DashboardCardProps) => (
  <div
    onMouseEnter={onHover}
    className={cn(
      "glass-card hover:border-indigo-500/50 group relative transition-all duration-300",
      isHighlighted && "border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02] z-10"
    )}
  >
    {isHighlighted && (
      <motion.div
        layoutId="pulse-card"
        className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-2xl pointer-events-none"
      />
    )}
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={cn("p-3 rounded-2xl bg-opacity-10 text-opacity-90", color)}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <MoreVertical size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10">{title}</p>
    <div className="flex items-baseline space-x-2 mt-1 relative z-10">
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      <span className="text-xs font-semibold text-emerald-500">+{trend}%</span>
    </div>
  </div>
);

export default function App() {
  const form = useForm({
    defaultValues: {
      fullName: '',
      tier: 'standard',
    }
  });

  const [dataType, setDataType] = useState<'realtime' | 'snapshots'>('realtime');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdProjects, setCreatedProjects] = useState<CreateProjectFormData[]>([]);

  const {
    registerMission,
    startMission,
    registerField,
    activeMission,
    currentStep,
    nextStep,
    fieldValues,
  } = useChalo({ form, debug: import.meta.env.DEV });

  const handleRegisterMissions = useCallback(() => {
    registerMission(ONBOARDING_MISSION);
    registerMission(DASHBOARD_TUTORIAL);
    registerMission(PRODUCT_TOUR_MISSION);
    registerMission(ACTION_ENGINE_MISSION);
  }, [registerMission]);

  useEffect(() => {
    handleRegisterMissions();
  }, [handleRegisterMissions]);

  const handleFormSubmit = form.handleSubmit((data) => {
    console.log('Form Submitted:', data);
    alert('Workspace Initialized!');
    if (activeMission?.id === 'saas-onboarding') nextStep();
  });

  const handleCreateProject = (data: CreateProjectFormData) => {
    console.log('Project Created:', data);
    setCreatedProjects((prev) => [...prev, data]);
    if (activeMission?.id === 'product-tour-create') {
      nextStep();
    }
  };

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
    // Mark the button as clicked for the waitFor condition
    const btn = document.querySelector('#btn-create-project');
    btn?.setAttribute('data-clicked', 'true');
    // Advance tour past the "find button" step if we're on it
    if (currentStep?.id === 'find-create-btn') {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen premium-gradient flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Navigation */}
        <nav className="glass sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b-0 m-4 rounded-3xl shadow-lg border-white/40">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} />
              <span className="font-bold text-xl tracking-tight leading-none">CHALO</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" className="text-indigo-600 dark:text-indigo-400">Main Mission</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Global Clusters</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Quantum Keys</a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-rose-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <Users size={20} className="text-indigo-500" />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Column: Form & Interaction */}
            <div className="w-full lg:w-1/3 space-y-8">
              <section className="glass p-8 rounded-3xl border-0 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck size={120} className="text-indigo-500" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                  <Terminal size={24} className="text-indigo-500" />
                  <span>Mission Center</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Trigger and track your active guiding missions.</p>

                <div className="space-y-4">
                  <button
                    onClick={() => startMission('saas-onboarding')}
                    disabled={activeMission?.id === 'saas-onboarding'}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Play size={18} fill="currentColor" />
                      <span className="font-semibold">Start Onboarding Flow</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => startMission('dashboard-tutorial')}
                    disabled={activeMission?.id === 'dashboard-tutorial'}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Grid size={18} />
                      <span className="font-semibold text-slate-500">Dashboard Mastery</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => startMission('product-tour-create')}
                    disabled={activeMission?.id === 'product-tour-create'}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen size={18} />
                      <span className="font-semibold text-slate-500">Product Tour: Create</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => startMission('action-engine-demo')}
                    disabled={activeMission?.id === 'action-engine-demo'}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Activity size={18} />
                      <span className="font-semibold text-slate-500">Action Engine Demo</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    id="btn-create-project"
                    onClick={handleCreateProjectClick}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FolderPlus size={18} />
                      <span className="font-semibold">Create Project</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>

                  {activeMission && (
                    <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Active Link</span>
                        <CircleDashed size={16} className="text-emerald-500 animate-spin" />
                      </div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-100">{activeMission.title}</p>
                      <div className="w-full h-1.5 bg-emerald-500/20 rounded-full mt-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(activeMission.steps.indexOf(currentStep!) + 1) / activeMission.steps.length * 100}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Config Form */}
              <section className="glass p-8 rounded-3xl border-0 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Initialize Node</h3>
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className={cn("space-y-1.5 group", currentStep?.targetField === 'fullName' && "ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input
                      {...registerField('fullName', { required: true })}
                      placeholder="e.g. John Quantum"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                    />
                    {form.formState.errors.fullName && <p className="text-xs text-rose-500 font-medium">This field is critical.</p>}
                  </div>

                  <div className={cn("space-y-1.5", currentStep?.targetField === 'tier' && "ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Tier</label>
                    <select
                      {...registerField('tier')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="standard">Standard Node</option>
                      <option value="enterprise">Enterprise Cluster</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    name="initialize_btn"
                    id="initialize_btn"
                    className={cn(
                      "w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-slate-900/10",
                      currentStep?.targetField === 'initialize_btn' && "ring-4 ring-indigo-500 animate-bounce"
                    )}
                  >
                    <ShieldCheck size={20} />
                    <span>Initialize Workspace</span>
                  </button>
                </form>
              </section>

              {/* Created Projects (from product tour) */}
              {createdProjects.length > 0 && (
                <section className="glass p-8 rounded-3xl border-0 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                    <FolderPlus size={20} className="text-emerald-500" />
                    <span>Created Projects</span>
                  </h3>
                  <div className="space-y-3">
                    {createdProjects.map((p, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{p.projectName}</p>
                        <p className="text-xs text-slate-400 mt-1">{p.description || 'No description'}</p>
                        <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-mono">
                          <span>{p.region}</span>
                          <span>·</span>
                          <span>{p.teamSize} members</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Dashboard */}
            <div className="flex-1 space-y-8">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Project Delta</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, {String(fieldValues.fullName || 'Commander')}. Nodes are stable.</p>
                </div>
                <div className={cn("flex items-center bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all",
                  currentStep?.id === 'chart-filter' && "ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900 animate-pulse"
                )}>
                  <button
                    onClick={() => setDataType('realtime')}
                    className={cn("px-4 py-2 font-bold rounded-xl active:scale-95 transition-all text-sm",
                      dataType === 'realtime' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    Realtime
                  </button>
                  <button
                    onClick={() => {
                      setDataType('snapshots');
                      if (currentStep?.id === 'chart-filter') nextStep();
                    }}
                    className={cn("px-4 py-2 font-bold rounded-xl active:scale-95 transition-all text-sm",
                      dataType === 'snapshots' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    Snapshots
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                  title="Active Clusters" value="242" trend="12.5" icon={LayoutDashboard} color="bg-indigo-500"
                  isHighlighted={currentStep?.id === 'kpi-cards'}
                />
                <DashboardCard
                  title="Incoming Packets" value="954k" trend="8.2" icon={Activity} color="bg-rose-500"
                  isHighlighted={currentStep?.id === 'kpi-cards'}
                />
                <DashboardCard
                  title="Uptime Index" value="99.9%" trend="0.1" icon={ShieldCheck} color="bg-emerald-500"
                  isHighlighted={currentStep?.id === 'kpi-cards'}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Main Chart Area */}
                <div className={cn("glass-card border-none min-h-75 flex flex-col justify-end p-8 relative overflow-hidden group", currentStep?.id === 'chart-overview' && "border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]")}>
                  <div className="absolute top-0 left-0 w-full h-full p-8 flex flex-col pointer-events-none">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Quantum Throughput</h4>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Network Cluster A-8</p>
                  </div>

                  <div className="flex items-end space-x-2 h-48">
                    {(dataType === 'realtime'
                      ? [40, 70, 45, 90, 65, 80, 55, 75, 45, 85, 95, 60]
                      : [25, 40, 30, 60, 45, 55, 35, 85, 20, 40, 65, 45]
                    ).map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                        className={cn("flex-1 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-lg group-hover:from-indigo-500 group-hover:to-rose-400 transition-colors", i % 2 === 0 && "opacity-80")}
                      />
                    ))}
                  </div>

                  {currentStep?.id === 'chart-overview' && (
                    <motion.div
                      layoutId="pulse"
                      className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-2xl pointer-events-none"
                    />
                  )}
                </div>

                {/* Activity Stream */}
                <div className={cn("glass-card border-none p-8 flex flex-col", currentStep?.id === 'activity-stream' && "border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]")}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Activity size={18} className="text-rose-500" />
                      <span>Node Activity</span>
                    </h4>
                    <span className="text-xs font-mono bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                  </div>

                  <div className="space-y-6">
                    {[
                      { node: 'Node-14', status: 'SYN_RECEIVED', time: '2ms ago' },
                      { node: 'Cluster-B', status: 'ENCRYPT_SUCCESS', time: '5ms ago' },
                      { node: 'Node-09', status: 'HEARTBEAT_OK', time: '12ms ago' },
                      { node: 'Mainframe', status: 'DEEP_SCAN_COMPLETE', time: '1m ago' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl h-10 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_bg-emerald-500/50]"></div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.node}</span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{item.status}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Stat Bar */}
              <div className="glass p-6 rounded-3xl flex items-center justify-between border-0 shadow-lg">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold">API Status: Stable</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-500">324 Active Commanders</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                  <span>Upgrade to Quantum</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CHALO LIBRARIES UI */}
      <SmartDrawer />

      {/* Create Project Modal (for product tour) */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        currentStepTarget={activeMission?.id === 'product-tour-create' ? currentStep?.targetField : undefined}
      />
    </div>
  );
}
