import React from 'react';
import { Card } from '@/components/ui/card';

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

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-safety/10 text-safety';
      case 'review':
        return 'bg-amber-100 text-amber-700';
      case 'rejected':
        return 'bg-fire/10 text-fire';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          <p className="text-muted-foreground mb-4">{project.client_name}</p>
          <div className="flex gap-4 text-sm">
            <span>Building Type: {project.building_type}</span>
            <span>Compliance Score: {project.compliance_score}%</span>
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
