import { useState, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { SmartDrawer } from '@osiloke/chalo';
import { Navbar } from '../components/Navbar';

export const Layout: FC = () => {
  const [drawerVariant, setDrawerVariant] = useState<'push' | 'overlay'>('push');

  const toggleDrawerVariant = () => {
    setDrawerVariant((v) => (v === 'push' ? 'overlay' : 'push'));
  };

  return (
    <div className="min-h-screen premium-gradient flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <Navbar drawerVariant={drawerVariant} onToggleDrawerVariant={toggleDrawerVariant} />
        <main className="flex-1">
          <Outlet context={{ drawerVariant, setDrawerVariant }} />
        </main>
      </div>

      {/* Global SmartDrawer mounted with configurable variant & portal support */}
      <SmartDrawer variant={drawerVariant} portal={true} />
    </div>
  );
};
