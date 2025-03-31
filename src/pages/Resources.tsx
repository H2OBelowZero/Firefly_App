import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Book, 
  Video, 
  Image, 
  Download, 
  Search,
  ChevronRight,
  Plus
} from 'lucide-react';

const Resources: React.FC = () => {
  // Mock data - replace with actual data fetching
  const resources = [
    {
      id: 1,
      title: 'SANS 10400-T Guide',
      type: 'Document',
      icon: FileText,
      category: 'Guidelines',
      description: 'Comprehensive guide to SANS 10400-T Fire Protection requirements',
      downloads: 245,
      lastUpdated: '2024-03-20'
    },
    {
      id: 2,
      title: 'Fire Safety Training Manual',
      type: 'Document',
      icon: Book,
      category: 'Training',
      description: 'Complete training manual for fire safety professionals',
      downloads: 189,
      lastUpdated: '2024-03-19'
    },
    {
      id: 3,
      title: 'Emergency Response Video',
      type: 'Video',
      icon: Video,
      category: 'Training',
      description: 'Step-by-step guide for emergency response procedures',
      downloads: 156,
      lastUpdated: '2024-03-18'
    },
    {
      id: 4,
      title: 'Fire Safety Checklist',
      type: 'Document',
      icon: FileText,
      category: 'Checklists',
      description: 'Comprehensive checklist for fire safety inspections',
      downloads: 312,
      lastUpdated: '2024-03-17'
    },
    {
      id: 5,
      title: 'Safety Signage Guide',
      type: 'Document',
      icon: Image,
      category: 'Guidelines',
      description: 'Guide to proper fire safety signage and placement',
      downloads: 178,
      lastUpdated: '2024-03-16'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-sm text-muted-foreground">
            Access and manage your fire safety resources
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </Button>
      </div>

      <Card className="p-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire/20"
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-fire/10 rounded-lg">
                      <Icon className="w-5 h-5 text-fire" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{resource.title}</h2>
                      <p className="text-sm text-muted-foreground">{resource.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Download className="w-4 h-4" />
                    <span>{resource.downloads} downloads</span>
                  </div>
                  <span className="text-muted-foreground">Updated {resource.lastUpdated}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Resources; 