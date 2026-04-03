import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Users, FileText, Hash, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CreateProjectFormData {
  projectName: string;
  description: string;
  region: string;
  teamSize: number;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData) => void;
  registerField?: (
    name: keyof CreateProjectFormData,
    options?: Record<string, unknown>
  ) => Record<string, unknown>;
  currentStepTarget?: string;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  registerField,
  currentStepTarget,
}: CreateProjectModalProps) {
  const form = useForm<CreateProjectFormData>({
    defaultValues: {
      projectName: '',
      description: '',
      region: 'us-east-1',
      teamSize: 1,
    },
  });

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    onClose();
  });

  const field = (name: keyof CreateProjectFormData) => {
    if (registerField) {
      return registerField(name, name === 'projectName' ? { required: true } : undefined);
    }
    return form.register(name, name === 'projectName' ? { required: true } : undefined);
  };

  const isHighlighted = (fieldName: string) => currentStepTarget === fieldName;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg mx-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Project</h2>
                      <p className="text-xs text-slate-400">Configure your project parameters</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Project Name */}
                  <div className={cn(
                    "space-y-1.5",
                    isHighlighted('projectName') && "ring-2 ring-indigo-500 ring-offset-2 rounded-xl p-2 -m-2 animate-pulse"
                  )}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <Hash size={12} />
                      <span>Project Name</span>
                    </label>
                    <input
                      {...field('projectName')}
                      placeholder="e.g. Project Nebula"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                    />
                    {form.formState.errors.projectName && (
                      <p className="text-xs text-rose-500 font-medium">Project name is required.</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className={cn(
                    "space-y-1.5",
                    isHighlighted('description') && "ring-2 ring-indigo-500 ring-offset-2 rounded-xl p-2 -m-2 animate-pulse"
                  )}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <FileText size={12} />
                      <span>Description</span>
                    </label>
                    <textarea
                      {...field('description')}
                      rows={3}
                      placeholder="Brief description of your project..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  {/* Region & Team Size Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "space-y-1.5",
                      isHighlighted('region') && "ring-2 ring-indigo-500 ring-offset-2 rounded-xl p-2 -m-2 animate-pulse"
                    )}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                        <Globe size={12} />
                        <span>Region</span>
                      </label>
                      <select
                        {...field('region')}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white appearance-none"
                      >
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">EU (Ireland)</option>
                        <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                      </select>
                    </div>

                    <div className={cn(
                      "space-y-1.5",
                      isHighlighted('teamSize') && "ring-2 ring-indigo-500 ring-offset-2 rounded-xl p-2 -m-2 animate-pulse"
                    )}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                        <Users size={12} />
                        <span>Team Size</span>
                      </label>
                      <input
                        {...field('teamSize')}
                        type="number"
                        min={1}
                        max={100}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={cn(
                    "flex items-center space-x-3 pt-2",
                    isHighlighted('submit_btn') && "ring-2 ring-indigo-500 ring-offset-2 rounded-xl p-2 -m-2 animate-pulse"
                  )}>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 size={18} />
                      <span>Create Project</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
