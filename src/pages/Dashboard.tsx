import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileIcon, Building2, ClipboardCheck, AlertTriangle } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import DashboardLayout from "@/components/DashboardLayout";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  client_name: string;
  building_type: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  compliance_score: number;
  created_at: string;
  last_edited_at: string;
}

interface ProjectStats {
  total: number;
  inProgress: number;
  approved: number;
  requiresAttention: number;
}

const Dashboard = () => {
  const { user, userDetails, loading } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [stats, setStats] = React.useState<ProjectStats>({
    total: 0,
    inProgress: 0,
    approved: 0,
    requiresAttention: 0
  });
  const [loadingData, setLoadingData] = React.useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch projects and calculate stats
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        setProjects(data || []);

        // Fetch stats
        const { data: allProjects, error: statsError } = await supabase
          .from('projects')
          .select('status');

        if (statsError) throw statsError;

        const projectStats = (allProjects || []).reduce((acc, project) => ({
          total: acc.total + 1,
          inProgress: acc.inProgress + (project.status === 'review' ? 1 : 0),
          approved: acc.approved + (project.status === 'approved' ? 1 : 0),
          requiresAttention: acc.requiresAttention + (project.status === 'rejected' ? 1 : 0),
        }), {
          total: 0,
          inProgress: 0,
          approved: 0,
          requiresAttention: 0
        });

        setStats(projectStats);
      } catch (error: any) {
        console.error('Error fetching projects:', error.message);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleNewProject = () => {
    navigate('/projects/wizard');
  };

  const statsArray = [
    {
      label: 'Total Projects',
      value: stats.total,
      icon: Building2,
      color: 'text-primary',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: ClipboardCheck,
      color: 'text-safety',
    },
    {
      label: 'Needs Review',
      value: stats.inProgress,
      icon: AlertTriangle,
      color: 'text-amber-500',
    },
  ];

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Welcome back, {userDetails?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <Button onClick={handleNewProject} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statsArray.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <h3 className="font-semibold">{stat.label}</h3>
              </div>
              <p className="mt-4 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Projects</h2>
            <Button onClick={handleNewProject} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button onClick={handleNewProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
