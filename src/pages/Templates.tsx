import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  FileText, 
  Building, 
  MapPin, 
  AlertCircle,
  ChevronRight,
  Search
} from 'lucide-react';

const Templates: React.FC = () => {
  // Mock data - replace with actual data fetching
  const templates = [
    {
      id: 1,
      name: 'Commercial Building Template',
      description: 'Standard template for commercial building fire safety assessment',
      category: 'Commercial',
      sections: [
        { name: 'Building Details', icon: Building },
        { name: 'Zones', icon: MapPin },
        { name: 'Special Risks', icon: AlertCircle }
      ]
    },
    {
      id: 2,
      name: 'Industrial Facility Template',
      description: 'Comprehensive template for industrial facility fire safety assessment',
      category: 'Industrial',
      sections: [
        { name: 'Building Details', icon: Building },
        { name: 'Zones', icon: MapPin },
        { name: 'Special Risks', icon: AlertCircle }
      ]
    },
    {
      id: 3,
      name: 'Residential Complex Template',
      description: 'Template for residential complex fire safety assessment',
      category: 'Residential',
      sections: [
        { name: 'Building Details', icon: Building },
        { name: 'Zones', icon: MapPin },
        { name: 'Special Risks', icon: AlertCircle }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage your project templates
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </Button>
      </div>

      <Card className="p-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fire/20"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{template.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                {template.sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      <span>{section.name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Templates; 