import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, 
  MapPin, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  X,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSansDoc, setSelectedSansDoc] = React.useState<string>('10400-T');

  // Mock data - replace with actual data fetching
  const project = {
    id,
    name: 'Sample Project',
    client: 'Sample Client',
    address: '123 Sample Street',
    status: 'In Progress',
    lastUpdated: '2024-03-20',
    buildings: [
      {
        id: 1,
        name: 'Main Building',
        classification: 'F1',
        construction: 'Concrete',
        area: 1000
      }
    ],
    zones: [
      {
        id: 1,
        name: 'Zone A',
        photos: []
      }
    ],
    specialRisks: {
      diesel_tank: {
        location: 'Back of building',
        photo: ''
      },
      inverter_canopy: {
        details: 'Solar panel installation',
        photo: ''
      },
      pallet_storage: {
        location: 'Warehouse',
        photo: ''
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar selectedSansDoc={selectedSansDoc} onSansDocChange={setSelectedSansDoc} />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{project.name}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Report Issue</span>
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project Overview */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Client</label>
                    <p className="font-medium">{project.client}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="font-medium">{project.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p className="font-medium">{project.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Updated</label>
                    <p className="font-medium">{project.lastUpdated}</p>
                  </div>
                </div>
              </Card>

              {/* Buildings */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Buildings</h2>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {project.buildings.map((building) => (
                    <div key={building.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{building.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {building.classification} • {building.construction} • {building.area}m²
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Zones */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Zones</h2>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {project.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{zone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {zone.photos.length} photos
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Special Risks */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Special Risks</h2>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Diesel Tank</p>
                        <p className="text-sm text-muted-foreground">{project.specialRisks.diesel_tank.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Inverter Canopy</p>
                        <p className="text-sm text-muted-foreground">{project.specialRisks.inverter_canopy.details}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pallet Storage</p>
                        <p className="text-sm text-muted-foreground">{project.specialRisks.pallet_storage.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-fire/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-fire" />
                    </div>
                    <div>
                      <p className="font-medium">Project created</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-fire/10 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-fire" />
                    </div>
                    <div>
                      <p className="font-medium">Photos uploaded</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Team Members */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Team Members</h2>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-fire/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-fire">JD</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Project Manager</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-fire/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-fire">AS</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Alice Smith</p>
                      <p className="text-sm text-muted-foreground">Fire Engineer</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails; 