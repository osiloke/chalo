import type { FC } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sparkles, LayoutDashboard, FileText, Wrench } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export interface NavbarProps {
  drawerVariant: 'push' | 'overlay';
  onToggleDrawerVariant: () => void;
}

export const Navbar: FC<NavbarProps> = ({ drawerVariant, onToggleDrawerVariant }) => {
  const navItems = [
    { to: '/', label: 'Catalog', icon: Sparkles },
    { to: '/saas', label: 'SaaS Platform', icon: LayoutDashboard },
    { to: '/forms', label: 'Form Workflows', icon: FileText },
    { to: '/diagnostics', label: 'Diagnostics', icon: Wrench },
  ];

  return (
    <nav className="glass sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b-0 m-4 rounded-3xl shadow-lg border-white/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2 bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-opacity">
          <Sparkles size={24} />
          <span className="font-bold text-xl tracking-tight leading-none">CHALO</span>
        </Link>
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Drawer Mode Badge / Switcher */}
        <button
          onClick={onToggleDrawerVariant}
          title="Click to switch drawer layout variant"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          Drawer: <span className="underline uppercase tracking-wide">{drawerVariant}</span>
        </button>

        <ThemeSwitcher />
      </div>
    </nav>
  );
};
