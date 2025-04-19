import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, Packer } from 'docx';

interface Project {
  id: string;
  company_name: string;
  client_name: string;
  facility_process: string;
  construction_year: number;
  status: string;
  created_at: string;
  updated_at: string;
  facility_location: {
    town: string;
    province: string;
  };
  buildings: Array<{
    id: string;
    name: string;
    classification: string;
    total_building_area: number;
    construction_materials: {
      brick: boolean;
      steel: boolean;
      concrete: boolean;
      timber: boolean;
      other: string | null;
    };
  }>;
  zones: Array<{
    id: string;
    name: string;
    classification: string;
    area: number;
    occupancy_type: string;
    photos?: string[];
  }>;
  special_risks: Array<{
    id: string;
    risk_type: string;
    location: string;
    details: string;
    photo_url?: string;
  }>;
  fire_protection_systems: Array<{
    id: string;
    type: string;
    description: string;
    coverage: string;
    maintenance_status: string;
  }>;
  emergency_procedures: Array<{
    id: string;
    type: string;
    description: string;
    responsible_person: string;
    contact_number: string;
  }>;
  automatic_fire_extinguishment_areas: Array<{
    id: string;
    name: string;
    commodity_name: string;
    maximum_stacking_height: number;
  }>;
  occupancy_separations: {
    separation_type: string;
    rating: number;
  };
  divisional_separations: {
    fire_rated_walls: boolean;
    fire_rated_doors: boolean;
  };
  escape_routes: Array<{
    id: string;
    name: string;
    travel_distance: number;
    width: number;
  }>;
  emergency_staircases: Array<{
    id: string;
    name: string;
    width: number;
    fire_rating: number;
    fire_rated: boolean;
  }>;
  signage_items: Array<{
    id: string;
    sign_type: string;
    location: string;
    photoluminescent: string;
  }>;
  emergency_lighting_zones: Array<{
    id: string;
    name: string;
    duration: number;
    lux_level: number;
  }>;
  fire_hose_reels: Array<{
    id: string;
    location: string;
    hose_length: number;
    coverage_radius: number;
  }>;
  fire_extinguishers: Array<{
    id: string;
    extinguisher_type: string;
    location: string;
    capacity: number;
  }>;
  fire_hydrants: Array<{
    id: string;
    location: string;
    hydrant_type: string;
    flow_rate: number;
  }>;
  firewater: {
    source: string;
    capacity: number;
    pressure: number;
  };
  fire_detection: {
    system_type: string;
    number_of_zones: number;
    battery_backup: number;
  };
  fire_alarm_panel: {
    panel_layout: string;
    zone_name: string;
  };
  smoke_ventilation_zones: Array<{
    id: string;
    name: string;
    area: number;
    ventilation_rate: number;
  }>;
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;

      try {
        // First fetch the main project data
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        // Then fetch all related data
        const [
          { data: facilityLocation },
          { data: buildings },
          { data: zones },
          { data: specialRisks },
          { data: fireProtectionSystems },
          { data: emergencyProcedures },
          { data: automaticFireExtinguishmentAreas },
          { data: occupancySeparations },
          { data: divisionalSeparations },
          { data: escapeRoutes },
          { data: emergencyStaircases },
          { data: signageItems },
          { data: emergencyLightingZones },
          { data: fireHoseReels },
          { data: fireExtinguishers },
          { data: fireHydrants },
          { data: firewater },
          { data: fireDetection },
          { data: fireAlarmPanel },
          { data: smokeVentilationZones }
        ] = await Promise.all([
          supabase.from('facility_locations').select('*').eq('project_id', id).single(),
          supabase.from('buildings').select('*').eq('project_id', id),
          supabase.from('zones').select('*').eq('project_id', id),
          supabase.from('special_risks').select('*').eq('project_id', id),
          supabase.from('fire_protection_systems').select('*').eq('project_id', id),
          supabase.from('emergency_procedures').select('*').eq('project_id', id),
          supabase.from('automatic_fire_extinguishment_areas').select('*').eq('project_id', id),
          supabase.from('occupancy_separations').select('*').eq('project_id', id).single(),
          supabase.from('divisional_separations').select('*').eq('project_id', id).single(),
          supabase.from('escape_routes').select('*').eq('project_id', id),
          supabase.from('emergency_staircases').select('*').eq('project_id', id),
          supabase.from('signage_items').select('*').eq('project_id', id),
          supabase.from('emergency_lighting_zones').select('*').eq('project_id', id),
          supabase.from('fire_hose_reels').select('*').eq('project_id', id),
          supabase.from('fire_extinguishers').select('*').eq('project_id', id),
          supabase.from('fire_hydrants').select('*').eq('project_id', id),
          supabase.from('firewater').select('*').eq('project_id', id).single(),
          supabase.from('fire_detection').select('*').eq('project_id', id).single(),
          supabase.from('fire_alarm_panel').select('*').eq('project_id', id).single(),
          supabase.from('smoke_ventilation_zones').select('*').eq('project_id', id)
        ]);

        // Combine all the data
        const completeProjectData = {
          ...projectData,
          facility_location: facilityLocation || { town: '', province: '' },
          buildings: buildings || [],
          zones: zones || [],
          special_risks: specialRisks || [],
          fire_protection_systems: fireProtectionSystems || [],
          emergency_procedures: emergencyProcedures || [],
          automatic_fire_extinguishment_areas: automaticFireExtinguishmentAreas || [],
          occupancy_separations: occupancySeparations || { separation_type: '', rating: 0 },
          divisional_separations: divisionalSeparations || { fire_rated_walls: false, fire_rated_doors: false },
          escape_routes: escapeRoutes || [],
          emergency_staircases: emergencyStaircases || [],
          signage_items: signageItems || [],
          emergency_lighting_zones: emergencyLightingZones || [],
          fire_hose_reels: fireHoseReels || [],
          fire_extinguishers: fireExtinguishers || [],
          fire_hydrants: fireHydrants || [],
          firewater: firewater || { source: '', capacity: 0, pressure: 0 },
          fire_detection: fireDetection || { system_type: '', number_of_zones: 0, battery_backup: 0 },
          fire_alarm_panel: fireAlarmPanel || { panel_layout: '', zone_name: '' },
          smoke_ventilation_zones: smokeVentilationZones || []
        };

        setProject(completeProjectData);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const handleExportToWord = async () => {
    if (!project) return;

    try {
      // Create a new Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Project Report",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: "Project Overview",
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Company Name")] }),
                    new TableCell({ children: [new Paragraph(project.company_name)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Client Name")] }),
                    new TableCell({ children: [new Paragraph(project.client_name)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Facility Process")] }),
                    new TableCell({ children: [new Paragraph(project.facility_process)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Location")] }),
                    new TableCell({ children: [new Paragraph(`${project.facility_location.town}, ${project.facility_location.province}`)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Construction Year")] }),
                    new TableCell({ children: [new Paragraph(project.construction_year.toString())] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Status")] }),
                    new TableCell({ children: [new Paragraph(project.status)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Last Updated")] }),
                    new TableCell({ children: [new Paragraph(new Date(project.updated_at).toLocaleDateString())] }),
                  ],
                }),
              ],
            }),
          ],
        }],
      });

      // Generate the document
      const buffer = await Packer.toBlob(doc);
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(buffer);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.company_name.replace(/\s+/g, '_')}_Project_Report.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Project report exported successfully!');
    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('Failed to export project report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <main className={`flex-1 flex items-center justify-center transition-all duration-300`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire"></div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-background">
        <main className={`flex-1 flex items-center justify-center transition-all duration-300`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <main className={`flex-1 overflow-hidden transition-all duration-300`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/projects')}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{project.company_name}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="gap-2" onClick={handleExportToWord}>
                  <Download className="w-4 h-4" />
                  <span>Export Project</span>
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
                    <p className="font-medium">{project.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Facility Process</label>
                    <p className="font-medium">{project.facility_process}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <p className="font-medium">
                      {project.facility_location.town}, {project.facility_location.province}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Construction Year</label>
                    <p className="font-medium">{project.construction_year}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p className="font-medium">{project.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Updated</label>
                    <p className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</p>
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
                            {building.classification} • {building.total_building_area}m²
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
                            {zone.classification} • {zone.area}m²
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
                  {project.special_risks.map((risk) => (
                    <div key={risk.id} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                          <p className="font-medium">{risk.risk_type}</p>
                          <p className="text-sm text-muted-foreground">{risk.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Automatic Fire Extinguishment Areas */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Automatic Fire Extinguishment Areas</h2>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                  </div>
                <div className="space-y-4">
                  {project.automatic_fire_extinguishment_areas.map((area) => (
                    <div key={area.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-medium">{area.name}</h3>
                        </div>
                        <div className="pl-8 space-y-2">
                          <div>
                            <label className="text-sm text-muted-foreground">Commodity</label>
                            <p className="font-medium">{area.commodity_name}</p>
                          </div>
                      <div>
                            <label className="text-sm text-muted-foreground">Maximum Stacking Height</label>
                            <p className="font-medium">{area.maximum_stacking_height}m</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Fire Detection */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Fire Detection System</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-muted-foreground">System Type</label>
                        <p className="font-medium">{project.fire_detection.system_type}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Number of Zones</label>
                        <p className="font-medium">{project.fire_detection.number_of_zones}</p>
                  </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Battery Backup</label>
                        <p className="font-medium">{project.fire_detection.battery_backup} hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fire Alarm Panel */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Fire Alarm Panel</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-muted-foreground">Panel Layout</label>
                        <p className="font-medium">{project.fire_alarm_panel.panel_layout}</p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Zone Name</label>
                        <p className="font-medium">{project.fire_alarm_panel.zone_name}</p>
                    </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Firewater */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Firewater System</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-muted-foreground">Source</label>
                        <p className="font-medium">{project.firewater.source}</p>
                    </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Capacity</label>
                        <p className="font-medium">{project.firewater.capacity} liters</p>
                    </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Pressure</label>
                        <p className="font-medium">{project.firewater.pressure} bar</p>
                    </div>
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