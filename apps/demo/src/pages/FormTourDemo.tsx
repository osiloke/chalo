import { useState, type FC } from 'react';
import { useChalo } from '@osiloke/chalo';
import { CreateProjectModal, type CreateProjectFormData } from '../CreateProjectModal';
import { PlainFields } from '../PlainFields';
import { FolderPlus, BookOpen, Terminal, CheckCircle2 } from 'lucide-react';

export const FormTourDemo: FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdProjects, setCreatedProjects] = useState<CreateProjectFormData[]>([
    { projectName: 'Cosmos Engine', region: 'us-east-1', teamSize: 12, description: 'Distributed computation fabric' }
  ]);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const {
    startMission,
    activeMission,
    currentStep,
    nextStep,
  } = useChalo();

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
    const btn = document.querySelector('#btn-create-project');
    btn?.setAttribute('data-clicked', 'true');
    if (currentStep?.id === 'find-create-btn') {
      nextStep();
    }
  };

  const handleCreateProject = (data: CreateProjectFormData) => {
    setCreatedProjects((prev) => [...prev, data]);
    if (activeMission?.id === 'product-tour-create') {
      nextStep();
    }
  };

  const handlePlainDeploy = (data: { serverName: string; deployRegion: string; cpuCores: number }) => {
    setDeployStatus(`Deployed ${data.serverName} to ${data.deployRegion} with ${data.cpuCores} cores`);
    if (activeMission?.id === 'plain-inputs-demo') {
      nextStep();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Modal & Form Interactions</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Project Workflows & Form Automation</h1>
        </div>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <button
            onClick={() => startMission('product-tour-create')}
            disabled={activeMission?.id === 'product-tour-create'}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <BookOpen size={16} />
            <span>Product Tour: Create Project</span>
          </button>
          <button
            onClick={() => startMission('plain-inputs-demo')}
            disabled={activeMission?.id === 'plain-inputs-demo'}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Terminal size={16} />
            <span>Plain Inputs Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Creation Area */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FolderPlus size={20} className="text-emerald-500" />
              <span>Project Inventory</span>
            </h3>
            <button
              id="btn-create-project"
              onClick={handleCreateProjectClick}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
            >
              <FolderPlus size={16} />
              <span>Create Project</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clicking Create Project opens a modal dialog. Chalo effortlessly guides users through dialog fields and submits them.
          </p>

          <div className="space-y-3">
            {createdProjects.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.projectName}</h4>
                  <p className="text-xs text-slate-500">{p.description || 'No description'} · Region: {p.region}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {p.teamSize} members
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plain HTML Inputs Demo Area */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Terminal size={20} className="text-indigo-500" />
            <span>Plain Inputs (No Form Library)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chalo doesn\'t require React Hook Form. It can inspect and update plain DOM inputs directly via standard name attributes.
          </p>

          <PlainFields onDeploy={handlePlainDeploy} currentStepTarget={activeMission?.id === 'plain-inputs-demo' ? currentStep?.targetField : undefined} />

          {deployStatus && (
            <div id="deploy-status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{deployStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal instance */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        currentStepTarget={activeMission?.id === 'product-tour-create' ? currentStep?.targetField : undefined}
      />
    </div>
  );
};
