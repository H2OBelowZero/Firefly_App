import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Users, MapPin, FileText, Clipboard, Check, Upload, X, Plus, Camera, ChevronDown, ChevronUp, BookOpen, Menu, Home, Settings, HelpCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/contexts/ProjectContext';
import { saveAs } from 'file-saver';
import { Database } from '@/types/database.types';

interface ReportType {
  id: string;
  name: string;
  description: string;
}

const reportTypes: ReportType[] = [
  {
    id: "fire_risk_assessment",
    name: "Fire Risk Assessment Report",
    description: "Comprehensive evaluation of fire risks and safety measures"
  },
  {
    id: "compliance_assessment",
    name: "Fire Safety Compliance Assessment Report",
    description: "Evaluate building design against regulations"
  },
  {
    id: "plan_review",
    name: "Building Plan Review Report",
    description: "Ensure fire safety requirements are met in design plans"
  },
  {
    id: "certificate_fitness",
    name: "Certificate of Fitness Application Report",
    description: "Support application for regulatory approval"
  },
  {
    id: "rational_design",
    name: "Rational Design Report",
    description: "Justify alternative fire safety designs"
  },
  {
    id: "compliance_audit",
    name: "Compliance Audit Report",
    description: "Assess existing buildings for regulatory compliance"
  }
];

// Update the special_risks type
type SpecialRisk = {
  id?: string;
  created_at?: string;
  project_id: string;
  risk_type: string;
  location: string;
  details: string;
  description: string;
  photo: string | null;
};

// Update the fire_detection type
type FireDetection = {
  id?: string;
  created_at?: string;
  project_id: string;
  system_type: string;
  number_of_zones: number;
  battery_backup: number;
  alarm_panel_photo: string;
};

// Update the fire_hose_reel type
type FireHoseReel = {
  id?: string;
  created_at?: string;
  project_id: string;
  name: string;
  location: string;
  hose_length: number;
  coverage_radius: number;
};

// Update the fire_extinguisher type
type FireExtinguisher = {
  id?: string;
  created_at?: string;
  project_id: string;
  extinguisher_type: string;
  location: string;
  capacity: number;
};

// Update the fire_hydrant type
type FireHydrant = {
  id?: string;
  created_at?: string;
  project_id: string;
  name: string;
  location: string;
  hydrant_type: string;
  flow_rate: number;
};

// Update the facility_location type
type FacilityLocation = {
  town: string;
  province: string;
};

// Update the smoke ventilation type
type SmokeVentilationZone = {
  id?: string;
  created_at?: string;
  project_id: string;
  name: string;
  description: string;
  photos: string[];
};

// Update the ProjectData type
type ProjectData = {
  reportType: string;
  client_name: string;
  company_name: string;
  facility_process: string;
  construction_year: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  facility_location: FacilityLocation;
  buildings: Array<{
    id?: string;
    project_id: string;
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
    id?: string;
    created_at?: string;
    project_id: string;
    building_id: string;
    name: string;
  }>;
  rooms: Array<{
    id?: string;
    created_at?: string;
    project_id: string;
    area_id: string;
    name: string;
    description: string;
    photo: string;
  }>;
  expected_commodities: Array<{
    id?: string;
    created_at?: string;
    project_id: string;
    area_id: string;
    name: string;
    category: string;
    stacking_height: string;
    storage_type: string;
  }>;
  special_risks: SpecialRisk[];
  escape_routes: Array<{
    id?: string;
    created_at?: string;
    project_id: string;
    name: string;
  }>;
  fire_hose_reels: FireHoseReel[];
  fire_extinguishers: FireExtinguisher[];
  fire_hydrants: FireHydrant[];
  fire_detection: FireDetection[];
  separations: Array<{
    id?: string;
    created_at?: string;
    project_id: string;
    first_building_id: string;
    second_building_id: string;
    first_area_id: string;
    second_area_id: string;
  }>;
  automatic_fire_extinguishment_areas: Array<{
    id?: string;
    project_id: string;
    area_id: string;
  }>;
  smoke_ventilation_zones: SmokeVentilationZone[];
  [key: string]: any; // Add index signature to allow string indexing
};

// Update type definitions for parameters
type Zone = {
  name: string;
  classification: string;
  area: number;
  occupancy_type: string;
  fire_load: any;
  photos?: string[];
  description: string;
};

const ProjectWizard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { refreshProjects } = useProjects();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);
  const [selectedSansDoc, setSelectedSansDoc] = useState<string>("10400-T");
  const [showSansSelector, setShowSansSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    zones: true,
    storage_details: true,
    sprinkler_zones: true,
    hydrant_locations: true,
    emergency_lighting_zones: true,
    door_rotation_diagrams: true,
    mandatory_actions: true,
    optional_actions: true
  });

  const [formData, setFormData] = useState<ProjectData>({
    reportType: '',
    client_name: '',
    company_name: '',
    facility_process: '',
    construction_year: 0,
    status: 'draft',
    facility_location: {
      town: '',
      province: ''
    },
    buildings: [],
    areas: [],
    rooms: [],
    expected_commodities: [],
    special_risks: [],
    escape_routes: [],
    fire_hose_reels: [],
    fire_extinguishers: [],
    fire_hydrants: [],
    fire_detection: [],
    separations: [],
    automatic_fire_extinguishment_areas: [],
    smoke_ventilation_zones: []
  });

  const handleInputChange = (field: keyof ProjectData | string, value: any) => {
    if (typeof field === 'string' && field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProjectData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = async (field: keyof ProjectData, index: number, value: any) => {
    if (field === 'buildings' && projectId && value.id) {
      try {
        // Update the building in the database
        const { error: updateError } = await supabase
          .from('buildings')
          .update({
            name: value.name,
            classification: value.classification,
            total_building_area: value.total_building_area,
            cad_drawing: value.cad_drawing,
            aerial_view: value.aerial_view,
            description: value.description,
            lower_wall_materials: value.lower_wall_materials,
            upper_wall_materials: value.upper_wall_materials
          })
          .eq('id', value.id);

        if (updateError) throw updateError;

        // Update the form data
        setFormData(prev => {
          const currentArray = prev[field];
          if (Array.isArray(currentArray)) {
            const newArray = [...currentArray];
            newArray[index] = value;
            return {
              ...prev,
              [field]: newArray
            };
          }
          return prev;
        });
      } catch (error) {
        console.error('Error updating building:', error);
        toast.error('Failed to update building. Please try again.');
      }
    } else {
      setFormData(prev => {
        const currentArray = prev[field];
        if (Array.isArray(currentArray)) {
          const newArray = [...currentArray];
          newArray[index] = value;
          return {
            ...prev,
            [field]: newArray
          };
        }
        return prev;
      });
    }
  };

  const handleArrayAdd = async (field: keyof ProjectData, value: any) => {
    if (field === 'buildings' && projectId) {
      try {
        // First, create the building record
        const { data: buildingData, error: buildingError } = await supabase
          .from('buildings')
          .insert({
            project_id: projectId,
            name: value.name,
            classification: value.classification,
            total_building_area: value.total_building_area,
            cad_drawing: value.cad_drawing,
            aerial_view: value.aerial_view,
            description: value.description,
            lower_wall_materials: value.lower_wall_materials,
            upper_wall_materials: value.upper_wall_materials
          })
          .select()
          .single();

        if (buildingError) throw buildingError;

        // Update the form data with the building ID
        setFormData(prev => {
          const currentArray = prev[field];
          if (Array.isArray(currentArray)) {
            const updatedArray = [...currentArray];
            const newBuilding = {
              ...value,
              id: buildingData.id
            };
            updatedArray.push(newBuilding);
            return {
              ...prev,
              [field]: updatedArray
            };
          }
          return prev;
        });

        toast.success('Building added successfully');
      } catch (error) {
        console.error('Error adding building:', error);
        toast.error('Failed to add building. Please try again.');
      }
    } else {
      setFormData(prev => {
        const currentArray = prev[field];
        if (Array.isArray(currentArray)) {
          return {
            ...prev,
            [field]: [...currentArray, value]
          };
        }
        return prev;
      });
    }
  };

  const handleArrayRemove = (field: keyof ProjectData, index: number) => {
    setFormData(prev => {
      const currentArray = prev[field];
      if (Array.isArray(currentArray)) {
        const newArray = [...currentArray];
        newArray.splice(index, 1);
        return {
          ...prev,
          [field]: newArray
        };
      }
      return prev;
    });
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= 7) { // Changed from steps.length to 7
    setCurrentStep(stepNumber);
    }
  };

  const steps = [
    { id: 1, name: 'Project Information' },
    { id: 2, name: 'Buildings' },
    { id: 3, name: 'Areas and Rooms' },
    { id: 4, name: 'Commodities in the Facility' },
    { id: 5, name: 'Special Risks' },
    { id: 6, name: 'Project Summary' }
  ];

  const nextStep = async () => {
    try {
      // Save draft before moving to next step
      await handleSaveDraft();
      
      if (currentStep < 7) { // Changed from steps.length - 1 to 7
      setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (!projectId) {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user?.id,
            report_type: formData.reportType,
            client_name: formData.client_name,
            company_name: formData.company_name,
            facility_process: formData.facility_process,
            construction_year: formData.construction_year,
            status: 'draft',
            facility_location: formData.facility_location
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }
        setProjectId(data.id);
      } else {
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            report_type: formData.reportType,
            client_name: formData.client_name,
            company_name: formData.company_name,
            facility_process: formData.facility_process,
            construction_year: formData.construction_year,
            status: 'draft',
            facility_location: formData.facility_location
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('Error updating project:', updateError);
          throw updateError;
        }
      }

      // Only proceed with related data if we're past step 0
      if (currentStep > 0) {
        // Handle buildings
        if (formData.buildings.length > 0) {
          console.log('Saving buildings:', formData.buildings);
          
          // First delete commodities
          const { error: deleteCommoditiesError } = await supabase
            .from('expected_commodities')
            .delete()
            .eq('project_id', projectId);

          if (deleteCommoditiesError) {
            console.error('Error deleting commodities:', deleteCommoditiesError);
            throw deleteCommoditiesError;
          }

          // Then delete rooms
          const { error: deleteRoomsError } = await supabase
            .from('rooms')
            .delete()
            .eq('project_id', projectId);

          if (deleteRoomsError) {
            console.error('Error deleting rooms:', deleteRoomsError);
            throw deleteRoomsError;
          }

          // Then delete areas
          const { error: deleteAreasError } = await supabase
            .from('areas')
            .delete()
            .eq('project_id', projectId);

          if (deleteAreasError) {
            console.error('Error deleting areas:', deleteAreasError);
            throw deleteAreasError;
          }

          // Finally delete buildings
          const { error: deleteBuildingsError } = await supabase
            .from('buildings')
            .delete()
            .eq('project_id', projectId);

          if (deleteBuildingsError) {
            console.error('Error deleting buildings:', deleteBuildingsError);
            throw deleteBuildingsError;
          }

          // Insert new buildings
          const { data: buildingsData, error: buildingsError } = await supabase
            .from('buildings')
            .insert(formData.buildings.map(building => ({
              project_id: projectId,
              name: building.name,
              classification: building.classification,
              total_building_area: building.total_building_area,
              cad_drawing: building.cad_drawing,
              aerial_view: building.aerial_view,
              description: building.description,
              lower_wall_materials: building.lower_wall_materials,
              upper_wall_materials: building.upper_wall_materials
            })))
            .select();

          if (buildingsError) {
            console.error('Error inserting buildings:', buildingsError);
            throw buildingsError;
          }

          if (!buildingsData) {
            throw new Error('No building data returned after insert');
          }

          // Create a map of old building IDs to new building IDs
          const buildingIdMap = new Map();
          formData.buildings.forEach((oldBuilding, index) => {
            if (oldBuilding.id && buildingsData[index]) {
              buildingIdMap.set(oldBuilding.id, buildingsData[index].id);
            }
            // Also map by name as a fallback
            if (oldBuilding.name && buildingsData[index]) {
              buildingIdMap.set(oldBuilding.name, buildingsData[index].id);
            }
          });

          // Update formData with new building IDs
          const updatedBuildings = formData.buildings.map((building, index) => ({
            ...building,
            id: buildingsData[index].id
          }));

          // Handle areas after buildings are saved and IDs are updated
          if (formData.areas.length > 0) {
            console.log('Saving areas:', formData.areas);
            
            // Insert new areas with updated building IDs
            const { data: areasData, error: areasError } = await supabase
              .from('areas')
              .insert(formData.areas.map(area => {
                const newBuildingId = buildingIdMap.get(area.building_id) || buildingIdMap.get(area.building_id?.toString());
                if (!newBuildingId) {
                  console.error('Could not find new building ID for area:', area);
                  throw new Error('Invalid building ID mapping');
                }
                return {
                  project_id: projectId,
                  building_id: newBuildingId,
                  name: area.name
                };
              }))
              .select();

            if (areasError) {
              console.error('Error inserting areas:', areasError);
              throw areasError;
            }

            if (!areasData) {
              throw new Error('No area data returned after insert');
            }

            // Create a map of old area IDs to new area IDs
            const areaIdMap = new Map();
            formData.areas.forEach((oldArea, index) => {
              if (oldArea.id && areasData[index]) {
                areaIdMap.set(oldArea.id, areasData[index].id);
              }
              // Also map by name as a fallback
              if (oldArea.name && areasData[index]) {
                areaIdMap.set(oldArea.name, areasData[index].id);
              }
            });

            // Update formData with new area IDs
            const updatedAreas = formData.areas.map((area, index) => ({
              ...area,
              id: areasData[index].id,
              building_id: buildingIdMap.get(area.building_id) || buildingIdMap.get(area.building_id?.toString()) || area.building_id
            }));

            // Handle rooms if we have areas
            if (formData.rooms.length > 0) {
              console.log('Saving rooms:', formData.rooms);
              
              // Insert rooms with updated area IDs
              const { data: roomsData, error: roomsError } = await supabase
                .from('rooms')
                .insert(formData.rooms.map(room => {
                  const newAreaId = areaIdMap.get(room.area_id) || areaIdMap.get(room.area_id?.toString());
                  if (!newAreaId) {
                    console.error('Could not find new area ID for room:', room);
                    throw new Error('Invalid area ID mapping');
                  }
                  return {
                    project_id: projectId,
                    area_id: newAreaId,
                    name: room.name,
                    description: room.description,
                    photo: room.photo || ''
                  };
                }))
                .select();

              if (roomsError) {
                console.error('Error inserting rooms:', roomsError);
                throw roomsError;
              }

              if (roomsData) {
                console.log('Rooms saved successfully:', roomsData);
                setFormData(prev => ({
                  ...prev,
                  buildings: updatedBuildings,
                  areas: updatedAreas,
                  rooms: roomsData
                }));
              }
            }

            // Handle expected commodities
            if (formData.expected_commodities.length > 0) {
              console.log('Saving commodities:', formData.expected_commodities);
              
              // Insert new commodities with updated area IDs
              const { data: commoditiesData, error: commoditiesError } = await supabase
                .from('expected_commodities')
                .insert(formData.expected_commodities.map(commodity => {
                  const newAreaId = areaIdMap.get(commodity.area_id) || areaIdMap.get(commodity.area_id?.toString());
                  if (!newAreaId) {
                    console.error('Could not find new area ID for commodity:', commodity);
                    throw new Error('Invalid area ID mapping');
                  }
                  // Convert stacking_height to a valid number format
                  const stackingHeight = commodity.stacking_height?.toString().replace(',', '.');
                  return {
                    project_id: projectId,
                    area_id: newAreaId,
                    name: commodity.name,
                    category: commodity.category,
                    stacking_height: stackingHeight ? parseFloat(stackingHeight) : null,
                    storage_type: commodity.storage_type
                  };
                }))
                .select();

              if (commoditiesError) {
                console.error('Error inserting commodities:', commoditiesError);
                throw commoditiesError;
              }

              if (commoditiesData) {
                console.log('Commodities saved successfully:', commoditiesData);
                setFormData(prev => ({
                  ...prev,
                  buildings: updatedBuildings,
                  areas: updatedAreas,
                  expected_commodities: commoditiesData
                }));
              }
            }
          }
        }

        // Handle special risks
        if (formData.special_risks.length > 0) {
          console.log('Saving special risks:', formData.special_risks);
          
          // First delete existing special risks
          const { error: deleteRisksError } = await supabase
            .from('special_risks')
            .delete()
            .eq('project_id', projectId);

          if (deleteRisksError) {
            console.error('Error deleting special risks:', deleteRisksError);
            throw deleteRisksError;
          }

          // Insert new special risks
          const { data: risksData, error: risksError } = await supabase
            .from('special_risks')
            .insert(formData.special_risks.map(risk => ({
              project_id: projectId,
              risk_type: risk.risk_type,
              description: risk.description || '',
              photo: risk.photo || ''
            })))
            .select();

          if (risksError) {
            console.error('Error inserting special risks:', risksError);
            throw risksError;
          }

          if (risksData) {
            console.log('Special risks saved successfully:', risksData);
            setFormData(prev => ({
              ...prev,
              special_risks: risksData
            }));
          }
        }
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const toggleBuilding = (index: number) => {
    setExpandedBuildings(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Common styles for form elements
  const inputStyles = "w-full px-4 py-2.5 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-fire/20 transition-all duration-200";
  const buttonStyles = "px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200";
  const cardStyles = "border border-border rounded-2xl p-6 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200";
  const checkboxWrapperStyles = "flex items-center space-x-3 cursor-pointer group";
  const checkboxStyles = "w-5 h-5 border-2 border-border rounded-xl checked:bg-fire checked:border-fire transition-all duration-200";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('No project ID found');
      return;
    }

    try {
      // Update the project status to 'completed'
        const { error: updateError } = await supabase
          .from('projects')
        .update({ status: 'completed' })
        .eq('id', projectId);

        if (updateError) throw updateError;

      toast.success('Project completed successfully');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error completing project:', error);
      toast.error('Failed to complete project. Please try again.');
    }
  };

  const handleRoomNameChange = (room: any, building: any, area: any, value: string) => {
    const updatedRooms = formData.rooms.map(r => 
      r.id === room.id ? { ...r, name: value } : r
    );
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  };

  const handleRoomDescriptionChange = (room: any, building: any, area: any, value: string) => {
    const updatedRooms = formData.rooms.map(r => 
      r.id === room.id ? { ...r, description: value } : r
    );
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  };

  const handleRoomAdd = (building: any, area: any) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const uniqueId = `${timestamp}_${randomId}`;
    
    const roomCount = formData.rooms
      .filter(r => r.area_id === area.id)
      .length + 1;
    
    const newRoom = {
      id: uniqueId,
      project_id: projectId || '',
      area_id: area.id,
      name: `Room ${roomCount}`,
      description: '',
      photo: ''
    };
    
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));

    toggleSection(`room_${uniqueId}`);
  };

  const handleRoomRemove = (room: any, building: any, area: any) => {
    const updatedRooms = formData.rooms.filter(r => r.id !== room.id);
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  };

  // Add commodity handlers
  const handleCommodityAdd = (area: any) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const uniqueId = `${timestamp}_${randomId}`;
    
    const newCommodity = {
      id: uniqueId,
      project_id: projectId || '',
      area_id: area.id,
      name: '',
      category: '',
      stacking_height: '',
      storage_type: ''
    };

    setFormData(prev => ({
      ...prev,
      expected_commodities: [...prev.expected_commodities, newCommodity]
    }));

    // Expand the section for the new commodity
    toggleSection(`commodity_${area.id}_${uniqueId}`);
  };

  const handleCommodityRemove = (commodity: any) => {
    const updatedCommodities = formData.expected_commodities.filter(c => c.id !== commodity.id);
    setFormData(prev => ({
      ...prev,
      expected_commodities: updatedCommodities
    }));
  };

  const handleCommodityChange = (commodity: any, field: string, value: string) => {
    const updatedCommodities = formData.expected_commodities.map(c => 
      c.id === commodity.id 
        ? { ...c, [field]: value }
        : c
    );
    setFormData(prev => ({
      ...prev,
      expected_commodities: updatedCommodities
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
              <div className="space-y-6">
                <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <select
                id="reportType"
                value={formData.reportType}
                onChange={(e) => handleInputChange('reportType', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Select a report type</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {formData.reportType && (
                <p className="text-sm text-muted-foreground">
                  {reportTypes.find(t => t.id === formData.reportType)?.description}
                </p>
              )}
                </div>
                
                <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter company name"
              />
                </div>
                
                  <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                placeholder="Enter client name"
              />
                  </div>
                  
                  <div className="space-y-2">
              <Label htmlFor="facility_process">Facility Process</Label>
              <Input
                id="facility_process"
                value={formData.facility_process}
                onChange={(e) => handleInputChange('facility_process', e.target.value)}
                placeholder="Enter facility process"
                className={inputStyles}
              />
                </div>
                
                <div className="space-y-2">
              <Label>Facility Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facility_location.town">Town</Label>
                  <select
                    id="facility_location.town"
                    value={formData.facility_location.town}
                    onChange={(e) => handleInputChange('facility_location', { ...formData.facility_location, town: e.target.value })}
                    className={inputStyles}
                  >
                    <option value="">Select town</option>
                    <option value="johannesburg">Johannesburg</option>
                    <option value="pretoria">Pretoria</option>
                    <option value="cape_town">Cape Town</option>
                    <option value="durban">Durban</option>
                    <option value="port_elizabeth">Port Elizabeth</option>
                    <option value="bloemfontein">Bloemfontein</option>
                    <option value="kimberley">Kimberley</option>
                    <option value="nelspruit">Nelspruit</option>
                    <option value="polokwane">Polokwane</option>
                    <option value="mbombela">Mbombela</option>
                    <option value="bisho">Bisho</option>
                    <option value="kimberley">Kimberley</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="facility_location.province">Province</Label>
                  <select
                    id="facility_location.province"
                    value={formData.facility_location.province}
                    onChange={(e) => handleInputChange('facility_location', { ...formData.facility_location, province: e.target.value })}
                    className={inputStyles}
                  >
                    <option value="">Select province</option>
                    <option value="gauteng">Gauteng</option>
                    <option value="western_cape">Western Cape</option>
                    <option value="kwazulu_natal">KwaZulu-Natal</option>
                    <option value="eastern_cape">Eastern Cape</option>
                    <option value="limpopo">Limpopo</option>
                    <option value="mpumalanga">Mpumalanga</option>
                    <option value="north_west">North West</option>
                    <option value="free_state">Free State</option>
                    <option value="northern_cape">Northern Cape</option>
                  </select>
              </div>
            </div>
            </div>

                <div className="space-y-2">
              <Label htmlFor="construction_year">Construction Year</Label>
                    <select 
                id="construction_year"
                value={formData.construction_year}
                onChange={(e) => handleInputChange('construction_year', parseInt(e.target.value))}
                className={inputStyles}
              >
                <option value="">Select year</option>
                {Array.from({ length: 2024 - 1900 + 1 }, (_, i) => (
                  <option key={i} value={2024 - i}>
                    {2024 - i}
                  </option>
                ))}
                    </select>
                  </div>
                </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Buildings Section */}
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium">Buildings</h4>
                  <p className="text-sm text-muted-foreground">Add buildings to your project</p>
                </div>
                <div
                  onClick={() => {
                    const newBuilding = {
                      project_id: projectId || '',
                      name: '',
                      classification: '',
                      total_building_area: 0,
                      cad_drawing: '',
                      aerial_view: '',
                      description: '',
                      lower_wall_materials: '',
                      upper_wall_materials: ''
                    };
                    handleArrayAdd('buildings', newBuilding);
                  }}
                  className={`${buttonStyles} btn-primary flex items-center space-x-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Building</span>
                </div>
              </div>

              <div className="space-y-6">
                {formData.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div
                        className="flex items-center justify-between flex-grow cursor-pointer"
                        onClick={() => toggleSection(`building_${buildingIndex}`)}
                      >
                        <div>
                          <span className="font-medium text-lg">{building.name || `Building ${buildingIndex + 1}`}</span>
                          {expandedSections[`building_${buildingIndex}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArrayRemove('buildings', buildingIndex);
                          }}
                          className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {expandedSections[`building_${buildingIndex}`] && (
                      <div className="p-4 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor={`building_${buildingIndex}_name`}>Building Name</Label>
                            <Input
                              type="text"
                              id={`building_${buildingIndex}_name`}
                              value={building.name}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, name: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter building name"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`building_${buildingIndex}_classification`}>Classification</Label>
                            <Input
                              type="text"
                              id={`building_${buildingIndex}_classification`}
                              value={building.classification}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, classification: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter building classification"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`building_${buildingIndex}_total_area`}>Total Building Area (m²)</Label>
                            <Input
                              type="text"
                              id={`building_${buildingIndex}_total_area`}
                              value={building.total_building_area}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, total_building_area: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter total building area"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`building_${buildingIndex}_description`}>Description</Label>
                            <Textarea
                              id={`building_${buildingIndex}_description`}
                              value={building.description}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, description: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter building description"
                              rows={4}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`building_${buildingIndex}_lower_wall`}>Lower Wall Materials</Label>
                            <Input
                              type="text"
                              id={`building_${buildingIndex}_lower_wall`}
                              value={building.lower_wall_materials}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, lower_wall_materials: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter lower wall materials"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`building_${buildingIndex}_upper_wall`}>Upper Wall Materials</Label>
                            <Input
                              type="text"
                              id={`building_${buildingIndex}_upper_wall`}
                              value={building.upper_wall_materials}
                              onChange={(e) => {
                                handleArrayChange('buildings', buildingIndex, { ...building, upper_wall_materials: e.target.value });
                              }}
                              className={inputStyles}
                              placeholder="Enter upper wall materials"
                            />
                          </div>
                        </div>

                        {/* CAD Drawing and Aerial View Upload */}
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label>CAD Drawing</Label>
                            <div className="mt-2">
                              {building.cad_drawing ? (
                                <div className="relative">
                                  <img
                                    src={building.cad_drawing}
                                    alt="CAD Drawing"
                                    className="w-32 h-32 object-cover rounded-xl"
                                  />
                                  <button
                                    onClick={() => {
                                      handleArrayChange('buildings', buildingIndex, { ...building, cad_drawing: '' });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    handleArrayChange('buildings', buildingIndex, { ...building, cad_drawing: 'placeholder.jpg' });
                                  }}
                                  className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <Upload className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>Aerial View</Label>
                            <div className="mt-2">
                              {building.aerial_view ? (
                                <div className="relative">
                                  <img
                                    src={building.aerial_view}
                                    alt="Aerial View"
                                    className="w-32 h-32 object-cover rounded-xl"
                                  />
                                  <button
                                    onClick={() => {
                                      handleArrayChange('buildings', buildingIndex, { ...building, aerial_view: '' });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    handleArrayChange('buildings', buildingIndex, { ...building, aerial_view: 'placeholder.jpg' });
                                  }}
                                  className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <Upload className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {/* Areas and Rooms Section */}
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium">Areas and Rooms</h4>
                  <p className="text-sm text-muted-foreground">Add areas and rooms to your buildings</p>
                </div>
              </div>

              <div className="space-y-6">
                {formData.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div
                        className="flex items-center justify-between flex-grow cursor-pointer"
                        onClick={() => toggleSection(`areas_building_${buildingIndex}`)}
                      >
                        <div>
                          <span className="font-medium text-lg">{building.name || `Building ${buildingIndex + 1}`}</span>
                        </div>
                        {expandedSections[`areas_building_${buildingIndex}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {expandedSections[`areas_building_${buildingIndex}`] && (
                      <div className="p-4 space-y-6">
                        {/* Areas Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">Areas</h5>
                            <button
                              onClick={() => {
                                console.log('Building data:', building); // Debug log
                                if (!building.id) {
                                  console.log('Building has no ID:', building); // Debug log
                                  // Try to find the building in the database
                                  const findBuilding = async () => {
                                    try {
                                      const { data, error } = await supabase
                                        .from('buildings')
                                        .select('id')
                                        .eq('project_id', projectId)
                                        .eq('name', building.name)
                                        .single();
                                      
                                      if (error) throw error;
                                      
                                      if (data) {
                                        // Update the building in formData with the ID
                                        setFormData(prev => {
                                          const updatedBuildings = prev.buildings.map(b => 
                                            b.name === building.name ? { ...b, id: data.id } : b
                                          );
                                          return { ...prev, buildings: updatedBuildings };
                                        });
                                        
                                        // Now add the area
                                        const timestamp = Date.now();
                                        const randomId = Math.random().toString(36).substring(2, 15);
                                        const uniqueId = `${timestamp}_${randomId}`;
                                        
                                        const newArea = {
                                          id: uniqueId,
                                          project_id: projectId || '',
                                          building_id: data.id,
                                          name: ''
                                        };

                                        setFormData(prev => ({
                                          ...prev,
                                          areas: [...prev.areas, newArea]
                                        }));

                                        toggleSection(`area_${uniqueId}`);
                                        return;
                                      }
                                    } catch (error) {
                                      console.error('Error finding building:', error);
                                    }
                                    toast.error('Please save the building first before adding areas');
                                  };
                                  
                                  findBuilding();
                                  return;
                                }
                                
                                // If we have a building ID, proceed with adding the area
                                const timestamp = Date.now();
                                const randomId = Math.random().toString(36).substring(2, 15);
                                const uniqueId = `${timestamp}_${randomId}`;
                                
                                const newArea = {
                                  id: uniqueId,
                                  project_id: projectId || '',
                                  building_id: building.id,
                                  name: ''
                                };

                                setFormData(prev => ({
                                  ...prev,
                                  areas: [...prev.areas, newArea]
                                }));

                                toggleSection(`area_${uniqueId}`);
                              }}
                              className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Area</span>
                            </button>
                          </div>

                          {formData.areas
                            .filter(area => area.building_id === building.id)
                            .map((area, areaIndex) => (
                              <div key={areaIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                  <div
                                    className="flex items-center justify-between flex-grow cursor-pointer"
                                    onClick={() => toggleSection(`area_${area.id}`)}
                                  >
                                    <span className="font-medium">{area.name || `Area ${areaIndex + 1}`}</span>
                                    {expandedSections[`area_${area.id}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updatedAreas = formData.areas.filter(a => a.id !== area.id);
                                      const updatedRooms = formData.rooms.filter(room => room.area_id !== area.id);
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        areas: updatedAreas,
                                        rooms: updatedRooms
                                      }));
                                    }}
                                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 cursor-pointer"
                                    title="Remove area and all its rooms"
                                  >
                                    <X className="w-5 h-5" />
                                  </div>
                                </div>

                                {expandedSections[`area_${area.id}`] && (
                                  <div className="p-4 space-y-6">
                                    <div>
                                      <Label htmlFor={`area_${area.id}_name`}>Area Name</Label>
                                      <Input
                                        key={`area_name_${building.id}_${area.id}`}
                                        type="text"
                                        id={`area_${area.id}_name`}
                                        value={area.name || ''}
                                        onChange={(e) => {
                                          const updatedAreas = formData.areas.map(a => {
                                            if (a.id === area.id && a.building_id === building.id) {
                                              return { ...a, name: e.target.value };
                                            }
                                            return a;
                                          });
                                          
                                          setFormData(prev => ({
                                            ...prev,
                                            areas: updatedAreas
                                          }));
                                        }}
                                        className={inputStyles}
                                        placeholder="Enter area name"
                                      />
                                    </div>

                                    {/* Rooms Section */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h6 className="font-medium">Rooms</h6>
                                        <button
                                          type="button"
                                          onClick={() => handleRoomAdd(building, area)}
                                          className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
                                        >
                                          <Plus className="w-4 h-4" />
                                          <span>Add Room</span>
                                        </button>
                                      </div>

                                      {formData.rooms
                                        .filter(room => room.area_id === area.id)
                                        .map((room, roomIndex) => (
                                          <div key={roomIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                                            <div className="flex items-center justify-between p-4 border-b border-border">
                                              <button
                                                className="flex items-center justify-between flex-grow"
                                                onClick={() => handleRoomRemove(room, building, area)}
                                              >
                                                <span className="font-medium">{room.name || `Room ${roomIndex + 1}`}</span>
                                                {expandedSections[`room_${room.id}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                              </button>
                                              <button
                                                onClick={() => handleRoomRemove(room, building, area)}
                                                className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                              >
                                                <X className="w-5 h-5" />
                                              </button>
                                            </div>

                                            {expandedSections[`room_${room.id}`] && (
                                              <div className="p-4 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                  <div>
                                                    <Label htmlFor={`room_${room.id}_name`}>Room Name</Label>
                                                    <Input
                                                      type="text"
                                                      id={`room_${room.id}_name`}
                                                      value={room.name || ''}
                                                      onChange={(e) => handleRoomNameChange(room, building, area, e.target.value)}
                                                      className={inputStyles}
                                                      placeholder="Enter room name"
                                                    />
                                                  </div>

                                                  <div>
                                                    <Label htmlFor={`room_${room.id}_description`}>Description</Label>
                                                    <Textarea
                                                      id={`room_${room.id}_description`}
                                                      value={room.description || ''}
                                                      onChange={(e) => handleRoomDescriptionChange(room, building, area, e.target.value)}
                                                      className={inputStyles}
                                                      placeholder="Enter room description"
                                                      rows={4}
                                                    />
                                                  </div>
                                                </div>

                                                {/* Photo Upload Section */}
                                                <div>
                                                  <Label>Photo</Label>
                                                  <div className="mt-2">
                                                    {room.photo ? (
                                                      <div className="relative">
                                                        <img
                                                          src={room.photo}
                                                          alt={`Room ${room.name} photo`}
                                                          className="w-32 h-32 object-cover rounded-xl"
                                                        />
                                                        <button
                                                          onClick={() => {
                                                            const updatedRoom = { ...room, photo: '' };
                                                            const roomIndex = formData.rooms.findIndex(r => r.id === room.id);
                                                            handleArrayChange('rooms', roomIndex, updatedRoom);
                                                          }}
                                                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                                        >
                                                          <X className="w-4 h-4" />
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <button
                                                        onClick={() => {
                                                          const updatedRoom = { ...room, photo: 'placeholder.jpg' };
                                                          const roomIndex = formData.rooms.findIndex(r => r.id === room.id);
                                                          handleArrayChange('rooms', roomIndex, updatedRoom);
                                                        }}
                                                        className="w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                                                      >
                                                        <Upload className="w-8 h-8" />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            {/* Areas and Commodities Section */}
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium">Commodities in Areas</h4>
                  <p className="text-sm text-muted-foreground">Add commodities to your facility areas</p>
                </div>
              </div>

              <div className="space-y-6">
                {formData.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div
                        className="flex items-center justify-between flex-grow cursor-pointer"
                        onClick={() => toggleSection(`commodities_building_${buildingIndex}`)}
                      >
                        <div>
                          <span className="font-medium text-lg">{building.name || `Building ${buildingIndex + 1}`}</span>
                        </div>
                        {expandedSections[`commodities_building_${buildingIndex}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {expandedSections[`commodities_building_${buildingIndex}`] && (
                      <div className="p-4 space-y-6">
                        {formData.areas
                          .filter(area => area.building_id === building.id)
                          .map((area, areaIndex) => (
                            <div key={areaIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                              <div className="flex items-center justify-between p-4 border-b border-border">
                                <div className="flex items-center justify-between flex-grow">
                                  <span className="font-medium">{area.name || `Area ${areaIndex + 1}`}</span>
                                  <div
                                    onClick={() => handleCommodityAdd(area)}
                                    className={`${buttonStyles} btn-secondary flex items-center space-x-2 cursor-pointer`}
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Commodity</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 space-y-4">
                                {formData.expected_commodities
                                  .filter(commodity => commodity.area_id === area.id)
                                  .map((commodity, commodityIndex) => (
                                    <div key={commodityIndex} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                                      <div className="flex items-center justify-between p-4 border-b border-border">
                                        <div className="flex items-center justify-between flex-grow">
                                          <span className="font-medium">{commodity.name || `Commodity ${commodityIndex + 1}`}</span>
                                          <div
                                            onClick={() => handleCommodityRemove(commodity)}
                                            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 cursor-pointer"
                                          >
                                            <X className="w-5 h-5" />
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Commodity Name</Label>
                                            <Input
                                              value={commodity.name || ''}
                                              onChange={(e) => handleCommodityChange(commodity, 'name', e.target.value)}
                                              className={inputStyles}
                                              placeholder="Enter commodity name"
                                            />
                                          </div>
                                          <div>
                                            <Label>Category</Label>
                                            <select
                                              value={commodity.category || ''}
                                              onChange={(e) => handleCommodityChange(commodity, 'category', e.target.value)}
                                              className={inputStyles}
                                            >
                                              <option value="">Select category</option>
                                              <option value="I">Category I</option>
                                              <option value="II">Category II</option>
                                              <option value="III">Category III</option>
                                              <option value="IV">Category IV</option>
                                            </select>
                                          </div>
                                          <div>
                                            <Label>Stacking Height</Label>
                                            <Input
                                              type="text"
                                              value={commodity.stacking_height || ''}
                                              onChange={(e) => handleCommodityChange(commodity, 'stacking_height', e.target.value)}
                                              className={inputStyles}
                                              placeholder="Enter stacking height description"
                                            />
                                          </div>
                                          <div>
                                            <Label>Storage Type</Label>
                                            <Input
                                              value={commodity.storage_type || ''}
                                              onChange={(e) => handleCommodityChange(commodity, 'storage_type', e.target.value)}
                                              className={inputStyles}
                                              placeholder="Enter storage type"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium">Special Risks</h4>
                  <p className="text-sm text-muted-foreground">Add special risks to your project</p>
                </div>
                <button
                  onClick={() => {
                    const newRisk = {
                      project_id: projectId || '',
                      risk_type: '',
                      location: '',
                      details: '',
                      description: '',
                      photo: ''
                    };
                    handleArrayAdd('special_risks', newRisk);
                  }}
                  className={`${buttonStyles} btn-primary flex items-center space-x-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Special Risk</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.special_risks.map((risk, index) => (
                  <div key={index} className="border border-border rounded-xl bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div
                        className="flex items-center justify-between flex-grow cursor-pointer"
                        onClick={() => toggleSection(`risk_${index}`)}
                      >
                        <span className="font-medium">{risk.risk_type || `Risk ${index + 1}`}</span>
                        {expandedSections[`risk_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArrayRemove('special_risks', index);
                        }}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {expandedSections[`risk_${index}`] && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Risk Type</Label>
                            <select
                              value={risk.risk_type || ''}
                              onChange={(e) => {
                                const updatedRisks = formData.special_risks.map((r, i) =>
                                  i === index ? { ...r, risk_type: e.target.value } : r
                                );
                                setFormData(prev => ({
                                  ...prev,
                                  special_risks: updatedRisks
                                }));
                              }}
                              className={inputStyles}
                            >
                              <option value="">Select risk type</option>
                              <option value="Diesel Tank">Diesel Tank</option>
                              <option value="Inverter Canopy">Inverter Canopy</option>
                              <option value="Idle Pallet Storage">Idle Pallet Storage</option>
                              <option value="Indoor Oil Tank">Indoor Oil Tank</option>
                              <option value="Outdoor Oil Tank">Outdoor Oil Tank</option>
                              <option value="Transformer">Transformer</option>
                              <option value="Substation">Substation</option>
                              <option value="Generator">Generator</option>
                              <option value="Fork Lift Charging Stations">Fork Lift Charging Stations</option>
                              <option value="Mezannine">Mezannine</option>
                              <option value="Decommissioned Tanks">Decommissioned Tanks</option>
                            </select>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={risk.description || ''}
                              onChange={(e) => {
                                const updatedRisks = formData.special_risks.map((r, i) =>
                                  i === index ? { ...r, description: e.target.value } : r
                                );
                                setFormData(prev => ({
                                  ...prev,
                                  special_risks: updatedRisks
                                }));
                              }}
                              className={inputStyles}
                              placeholder="Enter risk description"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label>Photo</Label>
                            <div className="mt-2">
                              {risk.photo ? (
                                <div className="relative">
                                  <img
                                    src={risk.photo}
                                    alt={`Risk ${index + 1} photo`}
                                    className="w-32 h-32 object-cover rounded-xl"
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedRisks = formData.special_risks.map((r, i) =>
                                        i === index ? { ...r, photo: '' } : r
                                      );
                                      setFormData(prev => ({
                                        ...prev,
                                        special_risks: updatedRisks
                                      }));
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const updatedRisks = formData.special_risks.map((r, i) =>
                                      i === index ? { ...r, photo: 'placeholder.jpg' } : r
                                    );
                                    setFormData(prev => ({
                                      ...prev,
                                      special_risks: updatedRisks
                                    }));
                                  }}
                                  className="w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                  <Upload className="w-8 h-8" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            {/* Project Summary Section */}
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium">Project Summary</h4>
                  <p className="text-sm text-muted-foreground">Review and confirm your project details</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Project Information */}
                <div>
                  <h5 className="text-md font-medium mb-4">Project Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Report Type</Label>
                      <Input
                        value={formData.reportType}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Client Name</Label>
                      <Input
                        value={formData.client_name}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={formData.company_name}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Facility Process</Label>
                      <Input
                        value={formData.facility_process}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Construction Year</Label>
                      <Input
                        value={formData.construction_year}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input
                        value={formData.status}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Town</Label>
                      <Input
                        value={formData.facility_location.town}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Province</Label>
                      <Input
                        value={formData.facility_location.province}
                        className={inputStyles}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Buildings */}
                <div>
                  <h5 className="text-md font-medium mb-4">Buildings</h5>
                  <div className="space-y-4">
                    {formData.buildings.map((building, index) => (
                      <div key={index} className="border border-border rounded-xl p-4 bg-white/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Building Name</Label>
                            <Input value={building.name} readOnly className={inputStyles} />
                          </div>
                          <div>
                            <Label>Classification</Label>
                            <Input value={building.classification} readOnly className={inputStyles} />
                          </div>
                          <div>
                            <Label>Total Building Area</Label>
                            <Input value={building.total_building_area} readOnly className={inputStyles} />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea value={building.description} readOnly className={inputStyles} rows={2} />
                          </div>
                          <div>
                            <Label>Lower Wall Materials</Label>
                            <Input value={building.lower_wall_materials} readOnly className={inputStyles} />
                          </div>
                          <div>
                            <Label>Upper Wall Materials</Label>
                            <Input value={building.upper_wall_materials} readOnly className={inputStyles} />
                          </div>
                        </div>

                        {/* Areas in Building */}
                        <div className="mt-4">
                          <h6 className="text-sm font-medium mb-2">Areas</h6>
                          <div className="space-y-2">
                            {formData.areas
                              .filter(area => area.building_id === building.id)
                              .map((area, areaIndex) => (
                                <div key={areaIndex} className="border border-border rounded-lg p-3 bg-white/30">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{area.name}</span>
                                    
                                    {/* Rooms in Area */}
                                    <div className="space-y-2">
                                      {formData.rooms
                                        .filter(room => room.area_id === area.id)
                                        .map((room, roomIndex) => (
                                          <div key={roomIndex} className="text-sm">
                                            • {room.name}
                                          </div>
                                        ))}
                                    </div>

                                    {/* Commodities in Area */}
                                    <div className="space-y-2">
                                      {formData.expected_commodities
                                        .filter(commodity => commodity.area_id === area.id)
                                        .map((commodity, commodityIndex) => (
                                          <div key={commodityIndex} className="text-sm">
                                            • {commodity.name} ({commodity.category})
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Risks */}
                <div>
                  <h5 className="text-md font-medium mb-4">Special Risks</h5>
                  <div className="space-y-4">
                    {formData.special_risks.map((risk, index) => (
                      <div key={index} className="border border-border rounded-xl p-4 bg-white/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Risk Type</Label>
                            <Input value={risk.risk_type} readOnly className={inputStyles} />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea value={risk.description} readOnly className={inputStyles} rows={2} />
                          </div>
                          {risk.photo && (
                            <div className="col-span-2">
                              <Label>Photo</Label>
                              <img
                                src={risk.photo}
                                alt={`Risk ${index + 1}`}
                                className="w-32 h-32 object-cover rounded-xl mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Project Wizard</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          {currentStep === 7 ? (
            <Button
              onClick={handleSubmit}
              className="flex items-center space-x-2"
            >
              <span>Create Project</span>
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-8">
        {/* Steps Navigation */}
        <div className="w-64">
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {step.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="flex-1">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;