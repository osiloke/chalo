import type { FC, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DashboardCardProps {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  value: string;
  trend: string;
  color: string;
  isHighlighted?: boolean;
  onHover?: () => void;
}

export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  icon: Icon,
  value,
  trend,
  color,
  isHighlighted,
  onHover,
}) => (
  <div
    onMouseEnter={onHover}
    className={cn(
      "glass-card hover:border-indigo-500/50 group relative transition-all duration-300 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg",
      isHighlighted && "border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02] z-10"
    )}
  >
    {isHighlighted && (
      <motion.div
        layoutId="pulse-card"
        className="absolute inset-0 bg-indigo-500/5 animate-pulse rounded-3xl pointer-events-none"
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
