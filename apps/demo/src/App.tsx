import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useChalo } from '@osiloke/chalo';
import { ALL_MISSIONS } from './missions';
import { Layout } from './layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardSaaSDemo } from './pages/DashboardSaaSDemo';
import { FormTourDemo } from './pages/FormTourDemo';
import { DiagnosticsDemo } from './pages/DiagnosticsDemo';

export default function App() {
  const { registerMission } = useChalo({ debug: import.meta.env.DEV });

  useEffect(() => {
    // Register all application missions globally so they can be launched from any page or drawer
    ALL_MISSIONS.forEach((mission) => {
      registerMission(mission);
    });
  }, [registerMission]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="saas" element={<DashboardSaaSDemo />} />
          <Route path="forms" element={<FormTourDemo />} />
          <Route path="diagnostics" element={<DiagnosticsDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
