import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  company_name: string;
  client_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'in_progress' | 'completed';
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Delete related records first
      const tables = [
        'facility_locations',
        'buildings',
        'expected_commodities',
        'zones',
        'special_risks',
        'divisional_separations',
        'fire_alarm_panels',
        'escape_routes',
        'emergency_staircases',
        'signage_items',
        'emergency_lighting_zones',
        'fire_hose_reels',
        'fire_extinguishers',
        'fire_hydrants',
        'firewater',
        'fire_detection',
        'smoke_ventilation_zones',
        'mandatory_actions',
        'optional_actions',
        'engineer_signoff',
        'occupancy_separation',
        'automatic_fire_extinguishment_areas'
      ];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('project_id', projectId);
          
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }
      
      // Finally delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state
      setProjects(projects.filter(project => project.id !== projectId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const value = {
    projects,
    loading,
    error,
    refreshProjects: fetchProjects,
    deleteProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 