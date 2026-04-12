import { useEffect, useCallback, useState } from 'react';
import { useChalo } from '@osiloke/chalo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlainFieldsProps {
  currentStepTarget?: string;
  onDeploy: (data: { serverName: string; deployRegion: string; cpuCores: number }) => void;
}

/**
 * PlainFields - A form component that works WITHOUT react-hook-form.
 * 
 * It manually syncs with the Chalo store using:
 * - registerElement() for DOM targeting (action engine can find elements)
 * - fieldValues from store → local state (auto-fill from bubbles)
 * - fillField() to push local state → store (manual bidirectional sync)
 */
export function PlainFields({ currentStepTarget, onDeploy }: PlainFieldsProps) {
  const { registerElement, fillField, fieldValues } = useChalo();

  // Local state for controlled inputs
  const [serverName, setServerName] = useState('');
  const [deployRegion, setDeployRegion] = useState('us-east');
  const [cpuCores, setCpuCores] = useState(4);

  // Direction: Store → Local State (auto-fill from mission bubbles)
  useEffect(() => {
    if (fieldValues['serverName'] !== undefined && fieldValues['serverName'] !== serverName) {
      setServerName(String(fieldValues['serverName']));
    }
    if (fieldValues['deployRegion'] !== undefined && fieldValues['deployRegion'] !== deployRegion) {
      setDeployRegion(String(fieldValues['deployRegion']));
    }
    if (fieldValues['cpuCores'] !== undefined && fieldValues['cpuCores'] !== cpuCores) {
      setCpuCores(Number(fieldValues['cpuCores']));
    }
  }, [fieldValues, serverName, deployRegion, cpuCores]);

  // Direction: Local State → Store (on every change)
  const handleServerNameChange = useCallback((value: string) => {
    setServerName(value);
    fillField('serverName', value);
  }, [fillField]);

  const handleRegionChange = useCallback((value: string) => {
    setDeployRegion(value);
    fillField('deployRegion', value);
  }, [fillField]);

  const handleCoresChange = useCallback((value: number) => {
    setCpuCores(value);
    fillField('cpuCores', value);
  }, [fillField]);

  const handleSubmit = () => {
    onDeploy({ serverName, deployRegion, cpuCores });
  };

  const isHighlighted = (fieldName: string) => currentStepTarget === fieldName;

  return (
    <div className="space-y-5">
      {/* Server Name */}
      <div className={cn("space-y-1.5 group", isHighlighted('serverName') && "ring-2 ring-cyan-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Name</label>
        <input
          ref={registerElement('serverName')}
          type="text"
          value={serverName}
          onChange={(e) => handleServerNameChange(e.target.value)}
          placeholder="e.g. prod-server-01"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Deployment Region */}
      <div className={cn("space-y-1.5", isHighlighted('deployRegion') && "ring-2 ring-cyan-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deployment Region</label>
        <select
          ref={registerElement('deployRegion')}
          value={deployRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-slate-900 dark:text-white appearance-none"
        >
          <option value="us-east">US East</option>
          <option value="eu-west">EU West</option>
          <option value="ap-south">Asia Pacific</option>
        </select>
      </div>

      {/* CPU Cores */}
      <div className={cn("space-y-1.5", isHighlighted('cpuCores') && "ring-2 ring-cyan-500 ring-offset-4 ring-offset-slate-50 rounded-lg p-1 animate-pulse")}>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CPU Cores</label>
        <input
          ref={registerElement('cpuCores')}
          type="number"
          value={cpuCores}
          onChange={(e) => handleCoresChange(Number(e.target.value))}
          min={1}
          max={64}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Deploy Button */}
      <button
        ref={registerElement('deploy-btn')}
        id="deploy-btn"
        onClick={handleSubmit}
        className={cn(
          "w-full py-4 rounded-2xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-cyan-600/20",
          isHighlighted('deploy-btn') && "ring-4 ring-cyan-400 animate-bounce"
        )}
      >
        <span>Deploy Server</span>
      </button>
    </div>
  );
}
