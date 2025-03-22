import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Book, Video, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const resources = [
  {
    id: 1,
    title: 'SANS 10400 Guidelines',
    description: 'Comprehensive guide to SANS 10400 fire safety requirements and compliance.',
    type: 'document',
    category: 'Standards',
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'Fire Safety Best Practices',
    description: 'Learn about the latest fire safety best practices for different building types.',
    type: 'video',
    category: 'Training',
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'Compliance Checklist',
    description: 'Detailed checklist for ensuring fire safety compliance in your projects.',
    type: 'document',
    category: 'Tools',
    downloadUrl: '#'
  },
  {
    id: 4,
    title: 'Fire Plan Documentation',
    description: 'Templates and examples for fire plan documentation.',
    type: 'document',
    category: 'Templates',
    downloadUrl: '#'
  }
];

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-6 h-6" />;
    case 'book':
      return <Book className="w-6 h-6" />;
    default:
      return <FileText className="w-6 h-6" />;
  }
};

const Resources = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Resources</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{resource.title}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary rounded-full mt-2">
                    {resource.category}
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm">
                {resource.description}
              </p>
              
              <Button variant="outline" className="w-full" asChild>
                <a href={resource.downloadUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {resources.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No resources available</h3>
          <p className="text-muted-foreground">Check back later for new resources</p>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Resources; 