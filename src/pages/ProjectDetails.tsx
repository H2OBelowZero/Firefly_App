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
  Download,
  Edit,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  report_type: string;
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
    cad_drawing: string;
    aerial_view: string;
    description: string;
    lower_wall_materials: string;
    upper_wall_materials: string;
  }>;
  areas: Array<{
    id: string;
    project_id: string;
    building_id: string;
    name: string;
  }>;
  rooms: Array<{
    id: string;
    project_id: string;
    building_id: string;
    area_id: string;
    name: string;
    description: string;
    photos: string[];
  }>;
  expected_commodities: Array<{
    id: string;
    project_id: string;
    area_id: string;
    name: string;
    category: string;
    stacking_height: string;
    storage_type: string;
  }>;
  special_risks: Array<{
    id: string;
    project_id: string;
    risk_type: string;
    location: string;
    details: string;
    description: string;
    photo: string | null;
  }>;
}

const towns = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "East London",
  "Nelspruit",
  "Polokwane",
  "Kimberley",
  "Other"
];

const provinces = [
  "Gauteng",
  "Western Cape",
  "Eastern Cape",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape"
];

const buildingClassifications = [
  "A1 – Entertainment and public assembly",
  "A2 – Theatrical and indoor sport",
  "A3 – Places of instruction",
  "A4 – Worship",
  "A5 – Outdoor sport",
  "B1 – High risk commercial service",
  "B2 – Moderate risk commercial service",
  "B3 – Low risk commercial service",
  "C1 – Exhibition hall",
  "C2 – Museum",
  "D1 – High risk industrial",
  "D2 – Moderate risk industrial",
  "D3 – Low risk industrial",
  "D4 – Plant room",
  "E1 – Place of detention",
  "E2 – Hospital",
  "E3 – Other institutional (residential)",
  "E4 – Health care",
  "F1 – Large shop",
  "F2 – Small shop",
  "F3 – Wholesalers' store",
  "G1 – Offices",
  "H1 – Hotel",
  "H2 – Dormitory",
  "H3 – Domestic residence",
  "H4 – Dwelling house",
  "H5 – Hospitality",
  "J1 – High risk storage",
  "J2 – Moderate risk storage",
  "J3 – Low risk storage",
  "J4 – Parking garage"
];

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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
          { data: buildings },
          { data: areas },
          { data: rooms },
          { data: expectedCommodities },
          { data: specialRisks }
        ] = await Promise.all([
          supabase.from('buildings').select('*').eq('project_id', id),
          supabase.from('areas').select('*').eq('project_id', id),
          supabase.from('rooms').select('*').eq('project_id', id),
          supabase.from('expected_commodities').select('*').eq('project_id', id),
          supabase.from('special_risks').select('*').eq('project_id', id)
        ]);

        // Combine all the data
        const completeProjectData = {
          ...projectData,
          buildings: buildings || [],
          areas: areas || [],
          rooms: rooms || [],
          expected_commodities: expectedCommodities || [],
          special_risks: specialRisks || []
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
    if (!project) {
      toast.error('No project data available to export.');
      return;
    }

    try {
      // Create a text content with project data
      const textContent = `
Project Report
=============

Project Overview
---------------
Company Name: ${project.company_name || 'N/A'}
Client Name: ${project.client_name || 'N/A'}
Facility Process: ${project.facility_process || 'N/A'}
Location: ${project.facility_location?.town || 'N/A'}, ${project.facility_location?.province || 'N/A'}
Construction Year: ${project.construction_year || 'N/A'}
Status: ${project.status || 'N/A'}
Last Updated: ${project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}

Buildings
---------
${project.buildings?.map(building => `
Building Name: ${building.name || 'N/A'}
Classification: ${building.classification || 'N/A'}
Total Area: ${building.total_building_area || 'N/A'}m²
Construction Materials: ${Object.entries(building.construction_materials || {})
  .filter(([_, value]) => value === true)
  .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
  .join(', ')}${building.construction_materials?.other ? `, ${building.construction_materials.other}` : ''}
`).join('\n') || 'No buildings data available'}

Zones
-----
${project.zones?.map(zone => `
Zone Name: ${zone.name || 'N/A'}
Classification: ${zone.classification || 'N/A'}
Area: ${zone.area || 'N/A'}m²
Occupancy Type: ${zone.occupancy_type || 'N/A'}
`).join('\n') || 'No zones data available'}

Fire Protection Systems
----------------------
${project.fire_protection_systems?.map(system => `
System Type: ${system.type || 'N/A'}
Description: ${system.description || 'N/A'}
Coverage: ${system.coverage || 'N/A'}
Maintenance Status: ${system.maintenance_status || 'N/A'}
`).join('\n') || 'No fire protection systems data available'}

Special Risks
------------
${project.special_risks?.map(risk => `
Risk Type: ${risk.risk_type || 'N/A'}
Location: ${risk.location || 'N/A'}
Details: ${risk.details || 'N/A'}
`).join('\n') || 'No special risks data available'}

Emergency Procedures
------------------
${project.emergency_procedures?.map(procedure => `
Type: ${procedure.type || 'N/A'}
Description: ${procedure.description || 'N/A'}
Responsible Person: ${procedure.responsible_person || 'N/A'}
Contact Number: ${procedure.contact_number || 'N/A'}
`).join('\n') || 'No emergency procedures data available'}

Automatic Fire Extinguishment Areas
--------------------------------
${project.automatic_fire_extinguishment_areas?.map(area => `
Area Name: ${area.name || 'N/A'}
Commodity: ${area.commodity_name || 'N/A'}
Maximum Stacking Height: ${area.maximum_stacking_height || 'N/A'}m
`).join('\n') || 'No automatic fire extinguishment areas data available'}

Occupancy Separations
-------------------
Separation Type: ${project.occupancy_separations?.separation_type || 'N/A'}
Rating: ${project.occupancy_separations?.rating || 'N/A'}

Divisional Separations
--------------------
Fire Rated Walls: ${project.divisional_separations?.fire_rated_walls ? 'Yes' : 'No'}
Fire Rated Doors: ${project.divisional_separations?.fire_rated_doors ? 'Yes' : 'No'}

Escape Routes
------------
${project.escape_routes?.map(route => `
Route Name: ${route.name || 'N/A'}
Travel Distance: ${route.travel_distance || 'N/A'}m
Width: ${route.width || 'N/A'}m
`).join('\n') || 'No escape routes data available'}

Emergency Staircases
------------------
${project.emergency_staircases?.map(staircase => `
Staircase Name: ${staircase.name || 'N/A'}
Width: ${staircase.width || 'N/A'}m
Fire Rating: ${staircase.fire_rating || 'N/A'}
Fire Rated: ${staircase.fire_rated ? 'Yes' : 'No'}
`).join('\n') || 'No emergency staircases data available'}

Signage Items
------------
${project.signage_items?.map(sign => `
Sign Type: ${sign.sign_type || 'N/A'}
Location: ${sign.location || 'N/A'}
Photoluminescent: ${sign.photoluminescent || 'N/A'}
`).join('\n') || 'No signage items data available'}

Emergency Lighting Zones
----------------------
${project.emergency_lighting_zones?.map(zone => `
Zone Name: ${zone.name || 'N/A'}
Duration: ${zone.duration || 'N/A'} hours
Lux Level: ${zone.lux_level || 'N/A'} lux
`).join('\n') || 'No emergency lighting zones data available'}

Fire Hose Reels
--------------
${project.fire_hose_reels?.map(reel => `
Location: ${reel.location || 'N/A'}
Hose Length: ${reel.hose_length || 'N/A'}m
Coverage Radius: ${reel.coverage_radius || 'N/A'}m
`).join('\n') || 'No fire hose reels data available'}

Fire Extinguishers
----------------
${project.fire_extinguishers?.map(extinguisher => `
Extinguisher Type: ${extinguisher.extinguisher_type || 'N/A'}
Location: ${extinguisher.location || 'N/A'}
Capacity: ${extinguisher.capacity || 'N/A'} liters
`).join('\n') || 'No fire extinguishers data available'}

Fire Hydrants
------------
${project.fire_hydrants?.map(hydrant => `
Location: ${hydrant.location || 'N/A'}
Hydrant Type: ${hydrant.hydrant_type || 'N/A'}
Flow Rate: ${hydrant.flow_rate || 'N/A'} L/min
`).join('\n') || 'No fire hydrants data available'}

Firewater System
--------------
Source: ${project.firewater?.source || 'N/A'}
Capacity: ${project.firewater?.capacity || 'N/A'} liters
Pressure: ${project.firewater?.pressure || 'N/A'} bar

Fire Detection System
-------------------
System Type: ${project.fire_detection?.system_type || 'N/A'}
Number of Zones: ${project.fire_detection?.number_of_zones || 'N/A'}
Battery Backup: ${project.fire_detection?.battery_backup || 'N/A'} hours

Fire Alarm Panel
--------------
Panel Layout: ${project.fire_alarm_panel?.panel_layout || 'N/A'}
Zone Name: ${project.fire_alarm_panel?.zone_name || 'N/A'}

Smoke Ventilation Zones
---------------------
${project.smoke_ventilation_zones?.map(zone => `
Zone Name: ${zone.name || 'N/A'}
Area: ${zone.area || 'N/A'}m²
Ventilation Rate: ${zone.ventilation_rate || 'N/A'} m³/h
`).join('\n') || 'No smoke ventilation zones data available'}

Expected Commodities
-------------------
${project.expected_commodities?.map(commodity => `
Name: ${commodity.name || 'N/A'}
Category: ${commodity.category || 'N/A'}
Stacking Height: ${commodity.stacking_height || 'N/A'} m
Storage Type: ${commodity.storage_type || 'N/A'}
`).join('\n') || 'No expected commodities data available'}
      `;

      // Create a Blob with the text content
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.company_name?.replace(/\s+/g, '_') || 'Project'}_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Project report exported successfully!');
    } catch (error) {
      console.error('Error exporting project:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error('Failed to export project report. Please try again.');
    }
  };

  const sendToN8n = async () => {
    if (!project) {
      toast.error('No project data available');
      return;
    }

    try {
      // Create a copy of the project data without the ID
      const { id, ...projectDataWithoutId } = project;
      console.log('Sending data to n8n:', projectDataWithoutId);
      const response = await fetch('https://fireflyn8n.app.n8n.cloud/webhook-test/c3d9595b-21fc-475c-b223-cd20ac17f419', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({project: projectDataWithoutId})
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Data sent to n8n successfully:', data);
      toast.success('Data sent to n8n successfully');
      return data;
    } catch (error) {
      console.error('Error sending data to n8n:', error);
      toast.error('Failed to send data to n8n. Please try again.');
      throw error;
    }
  };

  const sendToDocumentero = async () => {
    if (!project) {
      toast.error('No project data available');
      return;
    }

    try {
      // Transform project data into the required format
      const formattedData = {
        company_name: project.company_name || '',
        client_name: project.client_name || '',
        town: project.facility_location?.town || '',
        province: project.facility_location?.province || '',
        facility_process: project.facility_process || '',
        construction_year: project.construction_year?.toString() || '',
        no_of_fire_hose_reels: '0', // This needs to be calculated or added to the project data
        buildings: project.buildings.map(building => ({
          name: building.name || '',
          description: building.description || '',
          classification: building.classification || '',
          lower_materials: building.lower_wall_materials || '',
          upper_materials: building.upper_wall_materials || '',
          classification_description: '', // This needs to be added to the project data
          total_building_area: building.total_building_area?.toString() || '',
          aerial_view: building.aerial_view || '',
          cad_drawing: building.cad_drawing || ''
        })),
        areas: project.areas.map(area => ({
          name: area.name || '',
          rooms: project.rooms
            .filter(room => room.area_id === area.id)
            .map(room => ({
              name: room.name || '',
              description: room.description || '',
              photo: room.photos?.[0] || '' // Using first photo if available
            })),
          commodities: project.expected_commodities
            .filter(commodity => commodity.area_id === area.id)
            .map(commodity => ({
              name: commodity.name || '',
              storage_type: commodity.storage_type || '',
              category: commodity.category || '',
              stacking_height: commodity.stacking_height || ''
            }))
        })),
        special_risks: [{
          diesel_tank_photo: project.special_risks.find(risk => risk.risk_type === 'Diesel Tank')?.photo || '',
          inverter_image: project.special_risks.find(risk => risk.risk_type === 'Inverter')?.photo || '',
          pallet_storage_photo: project.special_risks.find(risk => risk.risk_type === 'Pallet Storage')?.photo || ''
        }],
        engineer: [{
          name: '', // This needs to be added to the project data
          position: '' // This needs to be added to the project data
        }]
      };

      const response = await fetch('https://app.documentero.com/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          document: "A2wAQDytZ1S18SNvkAvg",
          apiKey: "DHMXSII-AXSU7JY-QO6MEOQ-GPR6PIQ",
          format: "docx",
          data: formattedData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Documentero response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Data sent to Documentero successfully:', data);

      // Handle the download link from the response
      if (data.downloadUrl) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${project.company_name?.replace(/\s+/g, '_') || 'Project'}_Report.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Document downloaded successfully');
      } else {
        toast.error('No download link found in the response');
      }

      return data;
    } catch (error) {
      console.error('Error sending data to Documentero:', error);
      toast.error('Failed to send data to Documentero. Please try again.');
      throw error;
    }
  };

  const handleEditDocument = async () => {
    try {
      // Send data to both n8n and Documentero
      await Promise.all([
        //sendToN8n(),
        sendToDocumentero()
      ]);
      navigate(`/projects/${id}/document`);
    } catch (error) {
      console.error('Error in handleEditDocument:', error);
      // Don't navigate if the requests fail
      toast.error('Failed to prepare document. Please try again.');
    }
  };

  const handleEditSection = (section: string, data: any) => {
    setEditingSection(section);
    setEditedData(data);
  };

  const handleSaveProject = async () => {
    if (!project || !id) return;
    
    setIsSaving(true);
    try {
      // Update the main project data
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          company_name: project.company_name,
          client_name: project.client_name,
          facility_process: project.facility_process,
          construction_year: project.construction_year,
          status: project.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (projectError) throw projectError;

      // Update facility location
      const { error: locationError } = await supabase
        .from('facility_locations')
        .update({
          town: project.facility_location.town,
          province: project.facility_location.province
        })
        .eq('project_id', id);

      if (locationError) throw locationError;

      // Update buildings
      for (const building of project.buildings) {
        const { error: buildingError } = await supabase
          .from('buildings')
          .update({
            name: building.name,
            classification: building.classification,
            total_building_area: building.total_building_area
          })
          .eq('id', building.id);

        if (buildingError) throw buildingError;

        if (building.construction_materials) {
          const { error: materialsError } = await supabase
            .from('building_construction_materials')
            .update(building.construction_materials)
            .eq('building_id', building.id);

          if (materialsError) throw materialsError;
        }
      }

      // Update zones
      for (const zone of project.zones) {
        const { error: zoneError } = await supabase
          .from('zones')
          .update({
            name: zone.name,
            classification: zone.classification,
            area: zone.area,
            occupancy_type: zone.occupancy_type
          })
          .eq('id', zone.id);

        if (zoneError) throw zoneError;
      }

      // Update special risks
      for (const risk of project.special_risks) {
        const { error: riskError } = await supabase
          .from('special_risks')
          .update({
            risk_type: risk.risk_type,
            location: risk.location,
            details: risk.details
          })
          .eq('id', risk.id);

        if (riskError) throw riskError;
      }

      // Update fire protection systems
      for (const system of project.fire_protection_systems) {
        const { error: systemError } = await supabase
          .from('fire_protection_systems')
          .update({
            type: system.type,
            coverage: system.coverage,
            maintenance_status: system.maintenance_status,
            description: system.description
          })
          .eq('id', system.id);

        if (systemError) throw systemError;
      }

      // Update emergency procedures
      for (const procedure of project.emergency_procedures) {
        const { error: procedureError } = await supabase
          .from('emergency_procedures')
          .update({
            type: procedure.type,
            responsible_person: procedure.responsible_person,
            contact_number: procedure.contact_number,
            description: procedure.description
          })
          .eq('id', procedure.id);

        if (procedureError) throw procedureError;
      }

      // Update automatic fire extinguishment areas
      for (const area of project.automatic_fire_extinguishment_areas) {
        const { error: areaError } = await supabase
          .from('automatic_fire_extinguishment_areas')
          .update({
            name: area.name,
            commodity_name: area.commodity_name,
            maximum_stacking_height: area.maximum_stacking_height
          })
          .eq('id', area.id);

        if (areaError) throw areaError;
      }

      // Update occupancy separations
      if (project.occupancy_separations) {
        const { error: occupancyError } = await supabase
          .from('occupancy_separations')
          .update({
            separation_type: project.occupancy_separations.separation_type,
            rating: project.occupancy_separations.rating
          })
          .eq('project_id', id);

        if (occupancyError) throw occupancyError;
      }

      // Update divisional separations
      if (project.divisional_separations) {
        const { error: divisionalError } = await supabase
          .from('divisional_separations')
          .update({
            fire_rated_walls: project.divisional_separations.fire_rated_walls,
            fire_rated_doors: project.divisional_separations.fire_rated_doors
          })
          .eq('project_id', id);

        if (divisionalError) throw divisionalError;
      }

      toast.success('Project saved successfully');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditDialog = () => {
    if (!editingSection || !editedData) return null;

    const renderCollapsibleItem = (item: any, index: number, section: string) => (
      <div key={index} className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Item {index + 1}</h4>
          <Button variant="ghost" size="icon" onClick={() => {
            const newData = [...editedData];
            newData.splice(index, 1);
            setEditedData(newData);
          }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {section === 'buildings' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`building-name-${index}`}>Building Name</Label>
              <Input
                id={`building-name-${index}`}
                value={item.name}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, name: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`building-classification-${index}`}>Classification</Label>
              <Select
                value={item.classification}
                onValueChange={(value) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, classification: value };
                  setEditedData(newData);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {buildingClassifications.map((classification) => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`building-area-${index}`}>Total Building Area (m²)</Label>
              <Input
                id={`building-area-${index}`}
                type="number"
                value={item.total_building_area}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, total_building_area: parseFloat(e.target.value) };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Construction Materials</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`building-brick-${index}`}
                    checked={item.construction_materials?.brick}
                    onChange={(e) => {
                      const newData = [...editedData];
                      newData[index] = {
                        ...item,
                        construction_materials: {
                          ...item.construction_materials,
                          brick: e.target.checked
                        }
                      };
                      setEditedData(newData);
                    }}
                  />
                  <Label htmlFor={`building-brick-${index}`}>Brick</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`building-steel-${index}`}
                    checked={item.construction_materials?.steel}
                    onChange={(e) => {
                      const newData = [...editedData];
                      newData[index] = {
                        ...item,
                        construction_materials: {
                          ...item.construction_materials,
                          steel: e.target.checked
                        }
                      };
                      setEditedData(newData);
                    }}
                  />
                  <Label htmlFor={`building-steel-${index}`}>Steel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`building-concrete-${index}`}
                    checked={item.construction_materials?.concrete}
                    onChange={(e) => {
                      const newData = [...editedData];
                      newData[index] = {
                        ...item,
                        construction_materials: {
                          ...item.construction_materials,
                          concrete: e.target.checked
                        }
                      };
                      setEditedData(newData);
                    }}
                  />
                  <Label htmlFor={`building-concrete-${index}`}>Concrete</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`building-timber-${index}`}
                    checked={item.construction_materials?.timber}
                    onChange={(e) => {
                      const newData = [...editedData];
                      newData[index] = {
                        ...item,
                        construction_materials: {
                          ...item.construction_materials,
                          timber: e.target.checked
                        }
                      };
                      setEditedData(newData);
                    }}
                  />
                  <Label htmlFor={`building-timber-${index}`}>Timber</Label>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Other materials"
                  value={item.construction_materials?.other || ''}
                  onChange={(e) => {
                    const newData = [...editedData];
                    newData[index] = {
                      ...item,
                      construction_materials: {
                        ...item.construction_materials,
                        other: e.target.value
                      }
                    };
                    setEditedData(newData);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {section === 'zones' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`zone-name-${index}`}>Zone Name</Label>
              <Input
                id={`zone-name-${index}`}
                value={item.name}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, name: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`zone-classification-${index}`}>Classification</Label>
              <Input
                id={`zone-classification-${index}`}
                value={item.classification}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, classification: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`zone-area-${index}`}>Area (m²)</Label>
              <Input
                id={`zone-area-${index}`}
                type="number"
                value={item.area}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, area: parseFloat(e.target.value) };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`zone-occupancy-${index}`}>Occupancy Type</Label>
              <Input
                id={`zone-occupancy-${index}`}
                value={item.occupancy_type}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, occupancy_type: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
          </div>
        )}
        {section === 'special_risks' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`risk-type-${index}`}>Risk Type</Label>
              <Input
                id={`risk-type-${index}`}
                value={item.risk_type}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, risk_type: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`risk-location-${index}`}>Location</Label>
              <Input
                id={`risk-location-${index}`}
                value={item.location}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, location: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`risk-details-${index}`}>Details</Label>
              <Textarea
                id={`risk-details-${index}`}
                value={item.details}
                onChange={(e) => {
                  const newData = [...editedData];
                  newData[index] = { ...item, details: e.target.value };
                  setEditedData(newData);
                }}
              />
            </div>
          </div>
        )}
        {/* ... existing sections ... */}
      </div>
    );

    return (
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit {editingSection.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4 py-4">
              {/* ... existing project_overview section ... */}

              {/* Multiple Items Sections */}
              {['buildings', 'zones', 'special_risks', 'expected_commodities', 'escape_routes', 'emergency_staircases', 'signage_items', 
                'emergency_lighting_zones', 'fire_hose_reels', 'fire_extinguishers', 'fire_hydrants',
                'smoke_ventilation_zones', 'automatic_fire_extinguishment_areas'].includes(editingSection) && (
                <div className="space-y-4">
                  {editedData.map((item: any, index: number) => renderCollapsibleItem(item, index, editingSection))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const newItem = getDefaultItemForSection(editingSection);
                      setEditedData([...editedData, newItem]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}

              {/* ... existing single item sections ... */}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
              <Button onClick={handleSaveProject} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const getDefaultItemForSection = (section: string) => {
    switch (section) {
      case 'buildings':
        return {
          name: '',
          classification: '',
          total_building_area: 0,
          construction_materials: {
            brick: false,
            steel: false,
            concrete: false,
            timber: false,
            other: ''
          }
        };
      case 'zones':
        return { name: '', classification: '', area: 0, occupancy_type: '' };
      case 'special_risks':
        return { risk_type: '', location: '', details: '' };
      // ... existing cases ...
    }
  };

  const cardStyles = "border border-border rounded-2xl p-6 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200";

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Details</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleEditDocument}
          >
            <FileText className="mr-2 h-4 w-4" />
            Edit Document
          </Button>
          <Button onClick={handleSaveProject} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </>
            )}
          </Button>
        </div>
      </div>
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
                </div>
              </div>
            </header>

            {/* Main Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Step 1: Project Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Step 1: Project Information</h4>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleEditSection('project_overview', project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={cardStyles}>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Report Type</p>
                          <p className="font-medium">{project.report_type || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Company Name</p>
                          <p className="font-medium">{project.company_name || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Client Name</p>
                          <p className="font-medium">{project.client_name || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Facility Process</p>
                          <p className="font-medium">{project.facility_process || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {project.facility_location.town && project.facility_location.province
                              ? `${project.facility_location.town}, ${project.facility_location.province}`
                              : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Construction Year</p>
                          <p className="font-medium">{project.construction_year || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Buildings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Step 2: Buildings</h4>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleEditSection('buildings', project?.buildings)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={cardStyles}>
                    <div className="space-y-4">
                      {project.buildings.map((building, index) => (
                        <div key={building.id} className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Building Name</p>
                              <p className="font-medium">{building.name || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Classification</p>
                              <p className="font-medium">{building.classification || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Building Area</p>
                              <p className="font-medium">{building.total_building_area || 'Not specified'} m²</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="font-medium">{building.description || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Lower Wall Materials</p>
                              <p className="font-medium">{building.lower_wall_materials || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Upper Wall Materials</p>
                              <p className="font-medium">{building.upper_wall_materials || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Areas and Rooms */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Step 3: Areas and Rooms</h4>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleEditSection('areas', project?.areas)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={cardStyles}>
                    <div className="space-y-6">
                      {project.areas.map((area, areaIndex) => (
                        <div key={area.id} className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-fire" />
                            <h5 className="font-medium text-lg">{area.name}</h5>
                            </div>
                          <div className="ml-6 space-y-4">
                            {project.rooms
                              .filter(room => room.area_id === area.id)
                              .map((room, roomIndex) => (
                                <div key={room.id} className="space-y-3 bg-white/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-4 h-4 text-fire" />
                                      <h6 className="font-medium">{room.name}</h6>
                  </div>
                                    {room.photos && room.photos.length > 0 && (
                                      <div className="flex -space-x-2">
                                        {room.photos.slice(0, 3).map((photo, photoIndex) => (
                                          <div key={photoIndex} className="relative">
                                            <img
                                              src={photo}
                                              alt={`Room ${room.name} photo ${photoIndex + 1}`}
                                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                            />
                        </div>
                      ))}
                                        {room.photos.length > 3 && (
                                          <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs">
                                            +{room.photos.length - 3}
                    </div>
                                        )}
                  </div>
                                    )}
                </div>
                                  {room.description && (
                                    <p className="text-sm text-muted-foreground">{room.description}</p>
                                  )}
                        </div>
                      ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4: Commodities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Step 4: Commodities</h4>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleEditSection('expected_commodities', project?.expected_commodities)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={cardStyles}>
                    <div className="space-y-6">
                      {project.areas.map((area, areaIndex) => {
                        const areaCommodities = project.expected_commodities.filter(
                          commodity => commodity.area_id === area.id
                        );
                        
                        if (areaCommodities.length === 0) return null;

                        return (
                          <div key={area.id} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-fire" />
                              <h5 className="font-medium text-lg">{area.name}</h5>
                  </div>
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {areaCommodities.map((commodity, commodityIndex) => (
                                <div key={commodity.id} className="bg-white/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                                    <h6 className="font-medium">{commodity.name}</h6>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      commodity.category === 'I' ? 'bg-red-100 text-red-700' :
                                      commodity.category === 'II' ? 'bg-orange-100 text-orange-700' :
                                      commodity.category === 'III' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      Category {commodity.category}
                                    </span>
                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                      <p className="text-muted-foreground">Stacking Height</p>
                                      <p className="font-medium">{commodity.stacking_height}</p>
                            </div>
                            <div>
                                      <p className="text-muted-foreground">Storage Type</p>
                                      <p className="font-medium">{commodity.storage_type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                        );
                      })}
                </div>
                  </div>
                </div>

                {/* Step 5: Special Risks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Step 5: Special Risks</h4>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleEditSection('special_risks', project?.special_risks)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={cardStyles}>
                    <div className="space-y-6">
                      {project.buildings.map((building, buildingIndex) => {
                        // Remove the building-specific filtering since we don't have location data
                        const buildingRisks = project.special_risks || [];

                        if (buildingRisks.length === 0) return null;

                        return (
                          <div key={building.id} className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Building className="w-5 h-5 text-fire" />
                              <h5 className="font-medium text-lg">{building.name}</h5>
                            </div>
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {buildingRisks.map((risk, riskIndex) => (
                                <div key={risk.id} className="bg-white/50 p-4 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <AlertCircle className="w-4 h-4 text-red-500" />
                                      <h6 className="font-medium">{risk.risk_type}</h6>
                                    </div>
                                    {risk.photo && (
                                      <img
                                        src={risk.photo}
                                        alt={`Risk ${risk.risk_type} photo`}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Description</p>
                                      <p className="font-medium">{risk.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </main>
        {renderEditDialog()}
      </div>
    </div>
  );
};

export default ProjectDetails; 