import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const templates = [
  {
    id: 1,
    name: 'Commercial Building Template',
    description: 'Standard template for commercial buildings with SANS 10400 compliance checks.',
    category: 'Commercial',
    lastUpdated: '2024-03-20'
  },
  {
    id: 2,
    name: 'Residential Complex Template',
    description: 'Template for multi-unit residential buildings with fire safety requirements.',
    category: 'Residential',
    lastUpdated: '2024-03-19'
  },
  {
    id: 3,
    name: 'Healthcare Facility Template',
    description: 'Specialized template for hospitals and healthcare facilities.',
    category: 'Healthcare',
    lastUpdated: '2024-03-18'
  },
  {
    id: 4,
    name: 'Industrial Warehouse Template',
    description: 'Template for industrial buildings with specific fire safety considerations.',
    category: 'Industrial',
    lastUpdated: '2024-03-17'
  }
];

const Templates = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{template.name}</h3>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary rounded-full mt-2">
                  {template.category}
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Last updated: {new Date(template.lastUpdated).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No templates available</h3>
          <p className="text-muted-foreground mb-4">Create your first template to get started</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Templates; 