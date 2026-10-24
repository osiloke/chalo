import { useState, type FC } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, FileText, Wrench, Menu, X } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export interface NavbarProps {
  drawerVariant: 'push' | 'overlay';
  onToggleDrawerVariant: () => void;
}

export const Navbar: FC<NavbarProps> = ({ drawerVariant, onToggleDrawerVariant }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Catalog', icon: Sparkles },
    { to: '/saas', label: 'SaaS Platform', icon: LayoutDashboard },
    { to: '/forms', label: 'Form Workflows', icon: FileText },
    { to: '/diagnostics', label: 'Diagnostics', icon: Wrench },
  ];

  return (
    <>
      <nav className="glass sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between border-b-0 m-2 sm:m-4 rounded-2xl sm:rounded-3xl shadow-lg border-white/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3 sm:space-x-8">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-indigo-600 p-1.5 sm:p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-opacity"
          >
            <Sparkles size={20} className="sm:w-6 sm:h-6" />
            <span className="font-bold text-lg sm:text-xl tracking-tight leading-none">CHALO</span>
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

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Drawer Mode Badge / Switcher */}
          <button
            onClick={onToggleDrawerVariant}
            title="Click to switch drawer layout variant"
            className="text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <span className="hidden sm:inline">Drawer: </span>
            <span className="underline uppercase tracking-wide">{drawerVariant}</span>
          </button>

          <ThemeSwitcher />

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation drawer / dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-2 mb-2 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl flex flex-col space-y-1 z-29">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
};
