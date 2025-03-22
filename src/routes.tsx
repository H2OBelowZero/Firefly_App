import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ProjectWizard from '@/pages/ProjectWizard';
import Settings from '@/pages/Settings';
import Projects from '@/pages/Projects';
import Calendar from '@/pages/Calendar';
import Templates from '@/pages/Templates';
import Resources from '@/pages/Resources';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/wizard" element={<ProjectWizard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 