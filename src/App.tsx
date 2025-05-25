import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { UserProvider } from '@/contexts/UserContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectWizard from '@/pages/ProjectWizard';
import ProjectDetails from '@/pages/ProjectDetails';
import Settings from '@/pages/Settings';
import Team from '@/pages/Team';
import Profile from '@/pages/Profile';
import Calendar from '@/pages/Calendar';
import Templates from '@/pages/Templates';
import Resources from '@/pages/Resources';
import NotFound from '@/pages/NotFound';
import VerifyEmail from '@/pages/VerifyEmail';
import PrivateRoute from '@/components/PrivateRoute';
import DashboardLayout from '@/components/DashboardLayout';
import DocumentEditor from './pages/DocumentEditor';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <ProjectProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/verify-email" element={<VerifyEmail />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Projects />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/project-wizard"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <ProjectWizard />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/projects/:id"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <ProjectDetails />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/projects/:projectId/document"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <DocumentEditor />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Team />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Profile />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Calendar />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/templates"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Templates />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <PrivateRoute>
                        <DashboardLayout>
                          <Resources />
                        </DashboardLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </ProjectProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
