import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemePreset {
  name: string;
  label: string;
  colors: Record<string, string>;
}

// Theme presets demonstrating how consuming apps override Chalo tokens
const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'indigo',
    label: 'Indigo',
    colors: {
      '--color-chalo-primary': '#6366f1',
      '--color-chalo-primary-hover': '#4f46e5',
      '--color-chalo-primary-light': '#eef2ff',
      '--color-chalo-primary-border': '#e0e7ff',
      '--color-chalo-success': '#10b981',
      '--color-chalo-success-light': '#ecfdf5',
      '--color-chalo-success-border': '#d1fae5',
      '--color-chalo-error': '#f43f5e',
      '--color-chalo-error-light': '#fff1f2',
      '--color-chalo-error-border': '#ffe4e6',
      '--color-chalo-warning': '#f59e0b',
      '--color-chalo-warning-light': '#fffbeb',
      '--color-chalo-warning-border': '#fef3c7',
      '--color-chalo-info': '#3b82f6',
      '--color-chalo-info-light': '#eff6ff',
      '--color-chalo-info-border': '#dbeafe',
    },
  },
  {
    name: 'emerald',
    label: 'Emerald',
    colors: {
      '--color-chalo-primary': '#059669',
      '--color-chalo-primary-hover': '#047857',
      '--color-chalo-primary-light': '#ecfdf5',
      '--color-chalo-primary-border': '#a7f3d0',
      '--color-chalo-success': '#10b981',
      '--color-chalo-success-light': '#ecfdf5',
      '--color-chalo-success-border': '#d1fae5',
      '--color-chalo-error': '#ef4444',
      '--color-chalo-error-light': '#fef2f2',
      '--color-chalo-error-border': '#fecaca',
      '--color-chalo-warning': '#f59e0b',
      '--color-chalo-warning-light': '#fffbeb',
      '--color-chalo-warning-border': '#fef3c7',
      '--color-chalo-info': '#3b82f6',
      '--color-chalo-info-light': '#eff6ff',
      '--color-chalo-info-border': '#dbeafe',
    },
  },
  {
    name: 'violet',
    label: 'Violet',
    colors: {
      '--color-chalo-primary': '#7c3aed',
      '--color-chalo-primary-hover': '#6d28d9',
      '--color-chalo-primary-light': '#f5f3ff',
      '--color-chalo-primary-border': '#ddd6fe',
      '--color-chalo-success': '#10b981',
      '--color-chalo-success-light': '#ecfdf5',
      '--color-chalo-success-border': '#d1fae5',
      '--color-chalo-error': '#f43f5e',
      '--color-chalo-error-light': '#fff1f2',
      '--color-chalo-error-border': '#ffe4e6',
      '--color-chalo-warning': '#f59e0b',
      '--color-chalo-warning-light': '#fffbeb',
      '--color-chalo-warning-border': '#fef3c7',
      '--color-chalo-info': '#0ea5e9',
      '--color-chalo-info-light': '#f0f9ff',
      '--color-chalo-info-border': '#bae6fd',
    },
  },
  {
    name: 'rose',
    label: 'Rose',
    colors: {
      '--color-chalo-primary': '#e11d48',
      '--color-chalo-primary-hover': '#be123c',
      '--color-chalo-primary-light': '#fff1f2',
      '--color-chalo-primary-border': '#fecdd3',
      '--color-chalo-success': '#10b981',
      '--color-chalo-success-light': '#ecfdf5',
      '--color-chalo-success-border': '#d1fae5',
      '--color-chalo-error': '#dc2626',
      '--color-chalo-error-light': '#fef2f2',
      '--color-chalo-error-border': '#fecaca',
      '--color-chalo-warning': '#f59e0b',
      '--color-chalo-warning-light': '#fffbeb',
      '--color-chalo-warning-border': '#fef3c7',
      '--color-chalo-info': '#0ea5e9',
      '--color-chalo-info-light': '#f0f9ff',
      '--color-chalo-info-border': '#bae6fd',
    },
  },
];

// Dark mode overrides for each preset
const DARK_OVERRIDES: Record<string, Record<string, string>> = {
  indigo: {
    '--color-chalo-primary': '#818cf8',
    '--color-chalo-primary-hover': '#6366f1',
    '--color-chalo-primary-light': '#1e1b4b',
    '--color-chalo-primary-border': '#312e81',
    '--color-chalo-success': '#34d399',
    '--color-chalo-success-light': '#022c22',
    '--color-chalo-success-border': '#064e3b',
    '--color-chalo-error': '#fb7185',
    '--color-chalo-error-light': '#1c0a0e',
    '--color-chalo-error-border': '#4c0519',
    '--color-chalo-warning': '#fbbf24',
    '--color-chalo-warning-light': '#1c1407',
    '--color-chalo-warning-border': '#451a03',
    '--color-chalo-info': '#60a5fa',
    '--color-chalo-info-light': '#0c1929',
    '--color-chalo-info-border': '#1e3a5f',
  },
  emerald: {
    '--color-chalo-primary': '#34d399',
    '--color-chalo-primary-hover': '#10b981',
    '--color-chalo-primary-light': '#022c22',
    '--color-chalo-primary-border': '#064e3b',
    '--color-chalo-success': '#34d399',
    '--color-chalo-success-light': '#022c22',
    '--color-chalo-success-border': '#064e3b',
    '--color-chalo-error': '#f87171',
    '--color-chalo-error-light': '#1c0a0e',
    '--color-chalo-error-border': '#4c0519',
    '--color-chalo-warning': '#fbbf24',
    '--color-chalo-warning-light': '#1c1407',
    '--color-chalo-warning-border': '#451a03',
    '--color-chalo-info': '#60a5fa',
    '--color-chalo-info-light': '#0c1929',
    '--color-chalo-info-border': '#1e3a5f',
  },
  violet: {
    '--color-chalo-primary': '#a78bfa',
    '--color-chalo-primary-hover': '#8b5cf6',
    '--color-chalo-primary-light': '#1e1033',
    '--color-chalo-primary-border': '#3b1f6e',
    '--color-chalo-success': '#34d399',
    '--color-chalo-success-light': '#022c22',
    '--color-chalo-success-border': '#064e3b',
    '--color-chalo-error': '#fb7185',
    '--color-chalo-error-light': '#1c0a0e',
    '--color-chalo-error-border': '#4c0519',
    '--color-chalo-info': '#38bdf8',
    '--color-chalo-info-light': '#0c1929',
    '--color-chalo-info-border': '#1e3a5f',
  },
  rose: {
    '--color-chalo-primary': '#fb7185',
    '--color-chalo-primary-hover': '#f43f5e',
    '--color-chalo-primary-light': '#1c0a0e',
    '--color-chalo-primary-border': '#4c0519',
    '--color-chalo-success': '#34d399',
    '--color-chalo-success-light': '#022c22',
    '--color-chalo-success-border': '#064e3b',
    '--color-chalo-error': '#f87171',
    '--color-chalo-error-light': '#1c0a0e',
    '--color-chalo-error-border': '#4c0519',
    '--color-chalo-info': '#38bdf8',
    '--color-chalo-info-light': '#0c1929',
    '--color-chalo-info-border': '#1e3a5f',
  },
};

function applyThemeToRoot(preset: ThemePreset, isDark: boolean) {
  const root = document.documentElement;
  const colors = { ...preset.colors };

  if (isDark && DARK_OVERRIDES[preset.name]) {
    Object.assign(colors, DARK_OVERRIDES[preset.name]);
  }

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [presetName, setPresetName] = useState('indigo');
  const [isOpen, setIsOpen] = useState(false);

  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Apply theme whenever mode or preset changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveDark: boolean;
    if (mode === 'system') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      effectiveDark = mode === 'dark';
    }

    root.classList.add(effectiveDark ? 'dark' : 'light');
    applyThemeToRoot(THEME_PRESETS.find(p => p.name === presetName)!, effectiveDark);

    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        const updatedRoot = document.documentElement;
        updatedRoot.classList.remove('light', 'dark');
        updatedRoot.classList.add(e.matches ? 'dark' : 'light');
        applyThemeToRoot(THEME_PRESETS.find(p => p.name === presetName)!, e.matches);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, presetName]);

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Theme settings"
      >
        {isDark ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Theme Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-64 glass rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-4"
            >
              {/* Dark Mode Toggle */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Appearance
                </label>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {([
                    { key: 'light' as const, icon: Sun, label: 'Light' },
                    { key: 'system' as const, icon: Monitor, label: 'Auto' },
                    { key: 'dark' as const, icon: Moon, label: 'Dark' },
                  ]).map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setMode(key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium",
                        mode === key
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Presets */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Theme Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setPresetName(preset.name)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium",
                        presetName === preset.name
                          ? "border-chalo-primary bg-chalo-primary-light text-chalo-primary"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.colors['--color-chalo-primary'] }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  This demonstrates how consuming apps can override <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">@osiloke/chalo</code> theme tokens via CSS custom properties.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
