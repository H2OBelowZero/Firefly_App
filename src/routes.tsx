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
import Team from '@/pages/Team';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';
import PrivateRoute from '@/components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/projects/wizard" element={<PrivateRoute><ProjectWizard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
      <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
      <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
      <Route path="/team" element={<PrivateRoute><Team /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 