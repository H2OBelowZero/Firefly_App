import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building, Users, MapPin, FileText, Clipboard, Check, Upload, X, Plus, Camera, ChevronDown, ChevronUp, BookOpen, Menu, Home, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Building as BuildingType } from '@/types/database.types';
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

type Building = Database['public']['Tables']['buildings']['Row'] & {
  construction_materials: {
    brick: boolean;
    steel: boolean;
    concrete: boolean;
    timber: boolean;
    other: string | null;
  };
};

type ProjectData = {
  reportType: string;
  client_name: string;
  company_name: string;
  facility_process: string;
  construction_year: number;
  status: string;
  facility_location: {
    town: string;
    province: string;
  };
  buildings: Building[];
  expected_commodities: Array<{
    name: string;
    category: string;
    stacking_height: number;
    storage_type: string;
  }>;
  zones: Array<{
    name: string;
    classification: string;
    area: number;
    occupancy_type: string;
    fire_load: any;
    photos?: string[];
  }>;
  special_risks: Array<{
    risk_type: string;
    location: string;
    details: string;
    photo_url?: string;
  }>;
  fire_protection_systems: Array<{
    type: string;
    description: string;
    coverage: string;
    maintenance_status: string;
  }>;
  emergency_procedures: Array<{
    type: string;
    description: string;
    responsible_person: string;
    contact_number: string;
  }>;
  automatic_fire_extinguishment_areas: Array<{
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
    name: string;
    travel_distance: number;
    width: number;
  }>;
  emergency_staircases: Array<{
    name: string;
    width: number;
    fire_rating: number;
    fire_rated: boolean;
  }>;
  signage_items: Array<{
    sign_type: string;
    location: string;
    photoluminescent: string;
  }>;
  emergency_lighting_zones: Array<{
    name: string;
    duration: number;
    lux_level: number;
  }>;
  fire_hose_reels: Array<{
    location: string;
    hose_length: number;
    coverage_radius: number;
  }>;
  fire_extinguishers: Array<{
    extinguisher_type: string;
    location: string;
    capacity: number;
  }>;
  fire_hydrants: Array<{
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
    name: string;
    area: number;
    ventilation_rate: number;
  }>;
  recommendations: string;
  conclusion: string;
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
    reportType: "",
    client_name: '',
    company_name: '',
    facility_process: '',
    construction_year: 0,
    status: 'active',
    facility_location: {
      town: '',
      province: ''
    },
    buildings: [],
    expected_commodities: [],
    zones: [],
    special_risks: [],
    fire_protection_systems: [],
    emergency_procedures: [],
    automatic_fire_extinguishment_areas: [],
    occupancy_separations: {
      separation_type: '',
      rating: 0,
    },
    divisional_separations: {
      fire_rated_walls: false,
      fire_rated_doors: false,
    },
    escape_routes: [],
    emergency_staircases: [],
    signage_items: [],
    emergency_lighting_zones: [],
    fire_hose_reels: [],
    fire_extinguishers: [],
    fire_hydrants: [],
    firewater: {
      source: '',
      capacity: 0,
      pressure: 0
    },
    fire_detection: {
      system_type: '',
      number_of_zones: 0,
      battery_backup: 0
    },
    fire_alarm_panel: {
      panel_layout: '',
      zone_name: ''
    },
    smoke_ventilation_zones: [],
    recommendations: '',
    conclusion: ''
  });

  const handleInputChange = (field: string, value: any) => {
    if (currentStep === 1 && field.startsWith('buildings.')) {
      // Parse the field path to get the building index and field name
      const [_, index, fieldName] = field.split('.');
      const buildingIndex = parseInt(index);
      
      // Update the form data
      setFormData(prev => ({
      ...prev,
        buildings: prev.buildings.map((building, i) => 
          i === buildingIndex ? { ...building, [fieldName]: value } : building
        )
      }));
    } else if (field === 'facility_location.town' || field === 'facility_location.province') {
      // Handle facility location updates
      const [_, locationField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        facility_location: {
          ...prev.facility_location,
          [locationField]: value
        }
      }));
      } else {
      setFormData(prev => ({
          ...prev,
          [field]: value
      }));
      }
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => i === index ? value : item)
    }));
  };

  const handleArrayAdd = async (field: string, value: any) => {
    // First update the form data
    setFormData(prev => {
      const currentArray = prev[field as keyof ProjectData];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      }
      return prev;
    });

    // Only attempt to save building if we have a project ID and we're adding a building
    if (projectId && field === 'buildings') {
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
            aerial_view: value.aerial_view
          })
          .select()
          .single();

        if (buildingError) {
          console.error('Error creating building:', buildingError);
          throw buildingError;
        }

        // Then create the construction materials record
        if (buildingData && value.construction_materials) {
          const { error: materialsError } = await supabase
            .from('building_construction_materials')
            .insert({
              building_id: buildingData.id,
              brick: value.construction_materials.brick,
              steel: value.construction_materials.steel,
              concrete: value.construction_materials.concrete,
              timber: value.construction_materials.timber,
              other: value.construction_materials.other
            });

          if (materialsError) {
            console.error('Error creating construction materials:', materialsError);
            throw materialsError;
          }
        }

        // Update the form data with the building ID
        setFormData(prev => {
          const currentArray = prev[field as keyof ProjectData];
          if (Array.isArray(currentArray)) {
            const updatedArray = [...currentArray];
            const lastIndex = updatedArray.length - 1;
            updatedArray[lastIndex] = {
              ...updatedArray[lastIndex],
              id: buildingData.id
            };
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
        // Revert the form data if the save failed
        setFormData(prev => {
          const currentArray = prev[field as keyof ProjectData];
          if (Array.isArray(currentArray)) {
            return {
              ...prev,
              [field]: currentArray.slice(0, -1)
            };
          }
          return prev;
        });
      }
    }
  };

  // Add a new function to handle building updates in step 2
  const handleBuildingUpdate = async (index: number, updatedBuilding: Building) => {
    try {
      // First update the building in the database
      const { data: buildingData, error: buildingError } = await supabase
        .from('buildings')
        .update({
          name: updatedBuilding.name,
          classification: updatedBuilding.classification,
          total_building_area: updatedBuilding.total_building_area,
          cad_drawing: updatedBuilding.cad_drawing,
          aerial_view: updatedBuilding.aerial_view
        })
        .eq('id', updatedBuilding.id)
        .select()
        .single();

      if (buildingError) throw buildingError;

      // Then update the construction materials
      const { error: materialsError } = await supabase
        .from('building_construction_materials')
        .upsert({
          building_id: updatedBuilding.id,
          brick: updatedBuilding.construction_materials.brick,
          steel: updatedBuilding.construction_materials.steel,
          concrete: updatedBuilding.construction_materials.concrete,
          timber: updatedBuilding.construction_materials.timber,
          other: updatedBuilding.construction_materials.other
        })
        .eq('building_id', updatedBuilding.id);

      if (materialsError) throw materialsError;

      // Update the form data with the updated building
      setFormData(prev => ({
        ...prev,
        buildings: prev.buildings.map((building, i) => 
          i === index ? updatedBuilding : building
        )
      }));

      toast.success('Building updated successfully');
    } catch (error) {
      console.error('Error updating building:', error);
      toast.error('Failed to update building. Please try again.');
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= 7) { // Changed from steps.length to 7
    setCurrentStep(stepNumber);
    }
  };

  const steps = [
    { id: 1, name: 'Project Setup' },
    { id: 2, name: 'Occupancy Classification' },
    { id: 3, name: 'Facility Overview' },
    { id: 4, name: 'Commodity Classification' },
    { id: 5, name: 'Special Risks' },
    { id: 6, name: 'Fire Protection Systems' },
    { id: 7, name: 'Final Summary and Recommendations' }
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
        // Create new project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            report_type: formData.reportType,
            client_name: formData.client_name,
            company_name: formData.company_name,
            facility_process: formData.facility_process,
            construction_year: formData.construction_year,
            status: 'draft'
          })
          .select()
          .single();

        if (projectError) throw projectError;
        setProjectId(newProject.id);

        // Create facility location
        const { data: location, error: locationError } = await supabase
          .from('facility_locations')
          .insert({
            project_id: newProject.id,
            town: formData.facility_location.town,
            province: formData.facility_location.province
          })
          .select()
          .single();

        if (locationError) throw locationError;

        // Update project with facility location ID
        const { error: updateError } = await supabase
          .from('projects')
          .update({ facility_location_id: location.id })
          .eq('id', newProject.id);

        if (updateError) throw updateError;
      } else {
        // Update existing project
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            report_type: formData.reportType,
            client_name: formData.client_name,
            company_name: formData.company_name,
            facility_process: formData.facility_process,
            construction_year: formData.construction_year,
            status: 'draft'
          })
          .eq('id', projectId);

        if (updateError) throw updateError;

        // Update facility location
        const { error: locationError } = await supabase
          .from('facility_locations')
          .update({
            town: formData.facility_location.town,
            province: formData.facility_location.province
          })
          .eq('project_id', projectId);

        if (locationError) throw locationError;
      }

      // Only proceed with related data if we're past step 0
      if (currentStep > 0) {
        // Handle buildings and construction materials
        if (formData.buildings && formData.buildings.length > 0) {
          // Delete existing buildings and their materials
          const { error: deleteError } = await supabase
            .from('buildings')
            .delete()
            .eq('project_id', projectId);

          if (deleteError) throw deleteError;

          // Insert new buildings and their materials
          for (const building of formData.buildings) {
            const { data: newBuilding, error: buildingError } = await supabase
              .from('buildings')
              .insert({
                project_id: projectId,
                name: building.name,
                classification: building.classification,
                total_building_area: building.total_building_area,
                cad_drawing: building.cad_drawing,
                aerial_view: building.aerial_view
              })
              .select()
              .single();

            if (buildingError) throw buildingError;

            // Insert construction materials
            if (building.construction_materials) {
              const { error: materialsError } = await supabase
                .from('building_construction_materials')
                .insert({
                  building_id: newBuilding.id,
                  brick: building.construction_materials.brick,
                  steel: building.construction_materials.steel,
                  concrete: building.construction_materials.concrete,
                  timber: building.construction_materials.timber,
                  other: building.construction_materials.other
                });

              if (materialsError) throw materialsError;
            }
          }
        }

        // Handle zones and zone photos
        if (formData.zones && formData.zones.length > 0) {
          // Delete existing zones and their photos
          const { error: deleteError } = await supabase
            .from('zones')
            .delete()
            .eq('project_id', projectId);

          if (deleteError) throw deleteError;

          // Insert new zones and their photos
          for (const zone of formData.zones) {
            const { data: newZone, error: zoneError } = await supabase
              .from('zones')
              .insert({
                project_id: projectId,
                name: zone.name,
                classification: zone.classification,
                area: zone.area,
                occupancy_type: zone.occupancy_type,
                fire_load: zone.fire_load
              })
              .select()
              .single();

            if (zoneError) throw zoneError;

            // Insert zone photos
            if (zone.photos && zone.photos.length > 0) {
              const { error: photosError } = await supabase
                .from('zone_photos')
                .insert(
                  zone.photos.map(photo => ({
                    zone_id: newZone.id,
                    photo_url: photo
                  }))
                );

              if (photosError) throw photosError;
            }
          }
        }

        // Handle commodities
        if (currentStep >= 4 && formData.expected_commodities && formData.expected_commodities.length > 0) {
          // Delete existing commodities
          const { error: deleteError } = await supabase
            .from('expected_commodities')
            .delete()
            .eq('project_id', projectId);

          if (deleteError) throw deleteError;

          // Insert new commodities
          const { error: commoditiesError } = await supabase
            .from('expected_commodities')
            .insert(
              formData.expected_commodities.map(commodity => ({
                project_id: projectId,
                name: commodity.name,
                category: commodity.category,
                stacking_height: commodity.stacking_height,
                storage_type: commodity.storage_type
              }))
            );

          if (commoditiesError) throw commoditiesError;
        }

        // Handle special risks (step 5)
        if (currentStep >= 5 && formData.special_risks && formData.special_risks.length > 0) {
          // Delete existing special risks
          const { error: deleteError } = await supabase
            .from('special_risks')
            .delete()
            .eq('project_id', projectId);

          if (deleteError) {
            console.error('Error deleting special risks:', deleteError);
            throw deleteError;
          }

          // Insert new special risks
          for (const risk of formData.special_risks) {
            try {
              const { data: newRisk, error: riskError } = await supabase
                .from('special_risks')
                .insert({
                  project_id: projectId,
                  risk_type: risk.risk_type,
                  location: risk.location,
                  details: risk.details,
                  photo_url: risk.photo_url || null
                })
                .select()
                .single();

              if (riskError) {
                console.error('Error inserting special risk:', riskError);
                throw riskError;
              }
            } catch (error) {
              console.error('Error processing special risk:', error);
              throw error;
            }
          }
        }

        // Handle Automatic Fire Extinguishment Areas
        if (currentStep >= 6) {
          // Delete existing automatic fire extinguishment areas
          await supabase
            .from('automatic_fire_extinguishment_areas')
            .delete()
            .eq('project_id', projectId);

          // Insert new automatic fire extinguishment areas
          await Promise.all(
            formData.automatic_fire_extinguishment_areas.map(area =>
              supabase.from('automatic_fire_extinguishment_areas').insert({
                project_id: projectId,
                name: area.name,
                commodity_name: area.commodity_name,
                maximum_stacking_height: area.maximum_stacking_height
              })
            )
          );
        }

        // Handle Fire Protection Systems
        if (currentStep >= 6) {
          // Delete existing fire protection systems
          await supabase
            .from('fire_protection_systems')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire protection systems
          await Promise.all(
            formData.fire_protection_systems.map(system =>
              supabase.from('fire_protection_systems').insert({
                project_id: projectId,
                type: system.type,
                description: system.description,
                coverage: system.coverage,
                maintenance_status: system.maintenance_status
              })
            )
          );
        }

        // Handle Emergency Procedures
        if (currentStep >= 6) {
          // Delete existing emergency procedures
          await supabase
            .from('emergency_procedures')
            .delete()
            .eq('project_id', projectId);

          // Insert new emergency procedures
          await Promise.all(
            formData.emergency_procedures.map(procedure =>
              supabase.from('emergency_procedures').insert({
                project_id: projectId,
                type: procedure.type,
                description: procedure.description,
                responsible_person: procedure.responsible_person,
                contact_number: procedure.contact_number
              })
            )
          );
        }

        // Handle Occupancy Separation
        if (currentStep >= 6) {
          // Delete existing occupancy separation
          await supabase
            .from('occupancy_separations')
            .delete()
            .eq('project_id', projectId);

          // Insert new occupancy separation
          await supabase.from('occupancy_separations').insert({
            project_id: projectId,
            separation_type: formData.occupancy_separations.separation_type,
            rating: formData.occupancy_separations.rating
          });
        }

        // Handle Divisional Separation
        if (currentStep >= 6) {
          // Delete existing divisional separation
          await supabase
            .from('divisional_separations')
            .delete()
            .eq('project_id', projectId);

          // Insert new divisional separation
          await supabase.from('divisional_separations').insert({
            project_id: projectId,
            fire_rated_walls: formData.divisional_separations.fire_rated_walls,
            fire_rated_doors: formData.divisional_separations.fire_rated_doors
          });
        }

        // Handle Escape Routes
        if (currentStep >= 6) {
          // Delete existing escape routes
          await supabase
              .from('escape_routes')
            .delete()
            .eq('project_id', projectId);

          // Insert new escape routes
          await Promise.all(
            formData.escape_routes.map(route =>
              supabase.from('escape_routes').insert({
                  project_id: projectId,
                  name: route.name,
                  travel_distance: route.travel_distance,
                  width: route.width
              })
            )
          );
        }

        // Handle Emergency Staircases
        if (currentStep >= 6) {
          // Delete existing emergency staircases
          await supabase
              .from('emergency_staircases')
            .delete()
            .eq('project_id', projectId);

          // Insert new emergency staircases
          await Promise.all(
            formData.emergency_staircases.map(staircase =>
              supabase.from('emergency_staircases').insert({
                  project_id: projectId,
                  name: staircase.name,
                  width: staircase.width,
                fire_rated: staircase.fire_rated
              })
            )
          );
        }

        // Handle Signage Items
        if (currentStep >= 6) {
          // Delete existing signage items
          await supabase
              .from('signage_items')
            .delete()
            .eq('project_id', projectId);

          // Insert new signage items
          await Promise.all(
            formData.signage_items.map(sign =>
              supabase.from('signage_items').insert({
                  project_id: projectId,
                sign_type: sign.sign_type,
                location: sign.location,
                photoluminescent: sign.photoluminescent
              })
            )
          );
        }

        // Handle Emergency Lighting Zones
        if (currentStep >= 6) {
          // Delete existing emergency lighting zones
          await supabase
              .from('emergency_lighting_zones')
            .delete()
            .eq('project_id', projectId);

          // Insert new emergency lighting zones
          await Promise.all(
            formData.emergency_lighting_zones.map(zone =>
              supabase.from('emergency_lighting_zones').insert({
                  project_id: projectId,
                  name: zone.name,
                  duration: zone.duration,
                  lux_level: zone.lux_level
              })
            )
          );
        }

        // Handle Fire Hose Reels
        if (currentStep >= 6) {
          // Delete existing fire hose reels
          await supabase
              .from('fire_hose_reels')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire hose reels
          await Promise.all(
            formData.fire_hose_reels.map(reel =>
              supabase.from('fire_hose_reels').insert({
                  project_id: projectId,
                  location: reel.location,
                hose_length: reel.hose_length,
                  coverage_radius: reel.coverage_radius
              })
            )
          );
        }

        // Handle Fire Extinguishers
        if (currentStep >= 6) {
          // Delete existing fire extinguishers
          await supabase
              .from('fire_extinguishers')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire extinguishers
          await Promise.all(
            formData.fire_extinguishers.map(extinguisher =>
              supabase.from('fire_extinguishers').insert({
                  project_id: projectId,
                extinguisher_type: extinguisher.extinguisher_type,
                  location: extinguisher.location,
                  capacity: extinguisher.capacity
              })
            )
          );
        }

        // Handle Fire Hydrants
        if (currentStep >= 6) {
          // Delete existing fire hydrants
          await supabase
              .from('fire_hydrants')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire hydrants
          await Promise.all(
            formData.fire_hydrants.map(hydrant =>
              supabase.from('fire_hydrants').insert({
                  project_id: projectId,
                  location: hydrant.location,
                hydrant_type: hydrant.hydrant_type,
                  flow_rate: hydrant.flow_rate
              })
            )
          );
        }

        // Handle Fire Water
        if (currentStep >= 6) {
          // Delete existing fire water
          await supabase
            .from('firewater')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire water
          await supabase.from('firewater').insert({
                project_id: projectId,
            source: formData.firewater.source,
            capacity: formData.firewater.capacity,
            pressure: formData.firewater.pressure
          });
        }

        // Handle Fire Detection
        if (currentStep >= 6) {
          // Delete existing fire detection
          await supabase
              .from('fire_detection')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire detection
          await supabase.from('fire_detection').insert({
                project_id: projectId,
                system_type: formData.fire_detection.system_type,
                number_of_zones: formData.fire_detection.number_of_zones,
            battery_backup: formData.fire_detection.battery_backup
          });
        }

        // Handle Fire Alarm Panel
        if (currentStep >= 6) {
          // Delete existing fire alarm panel
          await supabase
              .from('fire_alarm_panel')
            .delete()
            .eq('project_id', projectId);

          // Insert new fire alarm panel
          await supabase.from('fire_alarm_panel').insert({
                project_id: projectId,
            panel_layout: formData.fire_alarm_panel.panel_layout,
            zone_name: formData.fire_alarm_panel.zone_name
          });
        }

        // Handle Smoke Ventilation Zones
        if (currentStep >= 6) {
          // Delete existing smoke ventilation zones
          await supabase
              .from('smoke_ventilation_zones')
            .delete()
            .eq('project_id', projectId);

          // Insert new smoke ventilation zones
          await Promise.all(
            formData.smoke_ventilation_zones.map(zone =>
              supabase.from('smoke_ventilation_zones').insert({
                  project_id: projectId,
                name: zone.name,
                area: zone.area,
                ventilation_rate: zone.ventilation_rate
              })
            )
          );
        }

        toast.success('Draft saved successfully');
      }
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
                    <select 
                id="facility_process"
                name="facility_process"
                value={formData.facility_process}
                onChange={(e) => handleInputChange('facility_process', e.target.value)}
                className={inputStyles}
              >
                <option value="">Select process</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="warehousing">Warehousing</option>
                <option value="distribution">Distribution</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
                      <option value="other">Other</option>
                    </select>
                </div>
                
                <div className="space-y-2">
              <Label>Facility Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facility_location.town">Town</Label>
                  <select
                    id="facility_location.town"
                    value={formData.facility_location.town}
                    onChange={(e) => handleInputChange('facility_location.town', e.target.value)}
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
                    onChange={(e) => handleInputChange('facility_location.province', e.target.value)}
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
                  <div className="space-y-2">
              <Label htmlFor="buildings">Buildings</Label>
              {formData.buildings.map((building, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleBuilding(index)}
                    >
                      <span className="font-medium">{building.name || `Building ${index + 1}`}</span>
                      {expandedBuildings.includes(index) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('buildings', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedBuildings.includes(index) && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`buildings.${index}.name`}>Building Name</Label>
                        <Input
                          type="text"
                          id={`buildings.${index}.name`}
                          name={`buildings.${index}.name`}
                          value={building.name}
                          onChange={(e) => handleArrayChange('buildings', index, { ...building, name: e.target.value })}
                          className={inputStyles}
                          placeholder="Enter building name"
                    />
                  </div>
                      <div>
                        <Label htmlFor={`buildings.${index}.classification`}>Classification</Label>
                        <select 
                          value={building.classification}
                          onChange={(e) => handleArrayChange('buildings', index, { ...building, classification: e.target.value })}
                          className={inputStyles}
                        >
                          <option value="">Select classification</option>
                          <option value="A1">A1 – Entertainment and public assembly</option>
                          <option value="A2">A2 – Theatrical and indoor sport</option>
                          <option value="A3">A3 – Places of instruction</option>
                          <option value="A4">A4 – Worship</option>
                          <option value="A5">A5 – Outdoor sport</option>
                          <option value="B1">B1 – High risk commercial service</option>
                          <option value="B2">B2 – Moderate risk commercial service</option>
                          <option value="B3">B3 – Low risk commercial service</option>
                          <option value="C1">C1 – Exhibition hall</option>
                          <option value="C2">C2 – Museum</option>
                          <option value="D1">D1 – High risk industrial</option>
                          <option value="D2">D2 – Moderate risk industrial</option>
                          <option value="D3">D3 – Low risk industrial</option>
                          <option value="D4">D4 – Plant room</option>
                          <option value="E1">E1 – Place of detention</option>
                          <option value="E2">E2 – Hospital</option>
                          <option value="E3">E3 – Other institutional (residential)</option>
                          <option value="E4">E4 – Health care</option>
                          <option value="F1">F1 – Large shop</option>
                          <option value="F2">F2 – Small shop</option>
                          <option value="F3">F3 – Wholesalers' store</option>
                          <option value="G1">G1 – Offices</option>
                          <option value="H1">H1 – Hotel</option>
                          <option value="H2">H2 – Dormitory</option>
                          <option value="H3">H3 – Domestic residence</option>
                          <option value="H4">H4 – Dwelling house</option>
                          <option value="H5">H5 – Hospitality</option>
                          <option value="J1">J1 – High risk storage</option>
                          <option value="J2">J2 – Moderate risk storage</option>
                          <option value="J3">J3 – Low risk storage</option>
                          <option value="J4">J4 – Parking garage</option>
                        </select>
                </div>
                      <div>
                        <Label htmlFor={`buildings.${index}.construction_materials`}>Construction Materials</Label>
                <div className="space-y-2">
                          {Object.entries({
                            brick: "Brick",
                            steel: "Steel",
                            concrete: "Concrete",
                            timber: "Timber"
                          }).map(([key, label]) => (
                            <label key={key} className={checkboxWrapperStyles}>
                  <input
                        type="checkbox"
                                checked={building.construction_materials[key]}
                                onChange={(e) => handleArrayChange('buildings', index, {
                                  ...building,
                                  construction_materials: {
                                    ...building.construction_materials,
                                    [key]: e.target.checked
                                  }
                                })}
                                className={checkboxStyles}
                              />
                              <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                                {label}
                              </span>
                      </label>
                          ))}
                          <Input
                            type="text"
                            value={building.construction_materials.other}
                            onChange={(e) => handleArrayChange('buildings', index, {
                              ...building,
                              construction_materials: {
                                ...building.construction_materials,
                                other: e.target.value
                              }
                            })}
                            className={inputStyles}
                            placeholder="Other materials"
                          />
                        </div>
                    </div>
                    
                      {/* Aerial View and CAD Drawings Section */}
                      <div className="space-y-2">
                        <Label>Aerial View & CAD Drawings</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`buildings.${index}.aerial_view`}>Aerial View (Google Maps)</Label>
                            <div className="flex items-center space-x-4">
                              {building.aerial_view ? (
                                <div className="relative">
                                  <img
                                    src={building.aerial_view}
                                    alt="Aerial View"
                                    className="w-32 h-32 object-cover rounded-2xl"
                                  />
                                  <button
                                    onClick={() => handleArrayChange('buildings', index, { ...building, aerial_view: '' })}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                    </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Add file upload logic here
                                    handleArrayChange('buildings', index, { ...building, aerial_view: 'placeholder.jpg' });
                                  }}
                                  className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                  <Upload className="w-8 h-8" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`buildings.${index}.cad_drawing`}>CAD Drawing</Label>
                            <div className="flex items-center space-x-4">
                              {building.cad_drawing ? (
                                <div className="relative">
                                  <img
                                    src={building.cad_drawing}
                                    alt="CAD Drawing"
                                    className="w-32 h-32 object-cover rounded-2xl"
                                  />
                                  <button
                                    onClick={() => handleArrayChange('buildings', index, { ...building, cad_drawing: '' })}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                    </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Add file upload logic here
                                    handleArrayChange('buildings', index, { ...building, cad_drawing: 'placeholder.jpg' });
                                  }}
                                  className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                  <Upload className="w-8 h-8" />
                                </button>
                              )}
                  </div>
                </div>
              </div>
            </div>
                      <div>
                        <Label htmlFor={`buildings.${index}.total_building_area`}>Total Building Area (m²)</Label>
                        <Input
                          type="number"
                          value={building.total_building_area}
                          onChange={(e) => handleArrayChange('buildings', index, { ...building, total_building_area: parseFloat(e.target.value) })}
                          className={inputStyles}
                          placeholder="Enter total building area"
                        />
                  </div>
                </div>
                  )}
                      </div>
              ))}
              <button
                onClick={() => handleArrayAdd('buildings', {
                  name: '',
                  classification: '',
                  construction_materials: {
                    brick: false,
                    steel: false,
                    concrete: false,
                    timber: false,
                    other: ''
                  },
                  total_building_area: 0,
                  cad_drawing: '',
                  aerial_view: ''
                })}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Building</span>
                      </button>
                    </div>
                  </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {/* Zones Section */}
            <div className="space-y-2">
              <Label htmlFor="zones">Zones</Label>
              {formData.zones.map((zone, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`zone_${index}`)}
                    >
                      <span className="font-medium">{zone.name || `Zone ${index + 1}`}</span>
                      {expandedSections[`zone_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('zones', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`zone_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`zones.${index}.name`}>Zone Name</Label>
                        <Input
                          type="text"
                          id={`zones.${index}.name`}
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            handleInputChange('zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter zone name"
                        />
                      </div>

                      {/* Photo Upload Section */}
                      <div>
                        <Label>Photos</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {zone.photos?.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative">
                              <img
                                src={photo}
                                alt={`Zone ${index + 1} Photo ${photoIndex + 1}`}
                                className="w-32 h-32 object-cover rounded-2xl"
                              />
                              <button
                                onClick={() => {
                                  const newZones = [...formData.zones];
                                  newZones[index].photos = newZones[index].photos.filter((_, i) => i !== photoIndex);
                                  handleInputChange('zones', newZones);
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              // Add file upload logic here
                              const newZones = [...formData.zones];
                              if (!newZones[index].photos) {
                                newZones[index].photos = [];
                              }
                              newZones[index].photos.push('placeholder.jpg');
                              handleInputChange('zones', newZones);
                            }}
                            className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                          >
                            <Upload className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newZones = [...formData.zones, { name: '', photos: [] }];
                  handleInputChange('zones', newZones);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Zone</span>
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expected_commodities">Expected Commodities</Label>
              {formData.expected_commodities.map((commodity, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`commodity_${index}`)}
                    >
                      <span className="font-medium">{commodity.name || `Commodity ${index + 1}`}</span>
                      {expandedSections[`commodity_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('expected_commodities', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`commodity_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`expected_commodities.${index}.name`}>Commodity Name</Label>
                        <Input
                          type="text"
                          id={`expected_commodities.${index}.name`}
                          value={commodity.name}
                          onChange={(e) => {
                            const newCommodities = [...formData.expected_commodities];
                            newCommodities[index] = { ...commodity, name: e.target.value };
                            handleInputChange('expected_commodities', newCommodities);
                          }}
                          className={inputStyles}
                          placeholder="Enter commodity name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`expected_commodities.${index}.category`}>Category</Label>
                        <select
                          id={`expected_commodities.${index}.category`}
                          value={commodity.category}
                          onChange={(e) => {
                            const newCommodities = [...formData.expected_commodities];
                            newCommodities[index] = { ...commodity, category: e.target.value };
                            handleInputChange('expected_commodities', newCommodities);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select category</option>
                          <option value="Class I">Class I</option>
                          <option value="Class II">Class II</option>
                          <option value="Class III">Class III</option>
                          <option value="Class IV">Class IV</option>
                          <option value="Class V">Class V</option>
                          <option value="Plastic">Plastic</option>
                          <option value="Rubber">Rubber</option>
                          <option value="Textile">Textile</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`expected_commodities.${index}.stacking_height`}>Stacking Height (m)</Label>
                        <Input
                          type="number"
                          id={`expected_commodities.${index}.stacking_height`}
                          value={commodity.stacking_height}
                          onChange={(e) => {
                            const newCommodities = [...formData.expected_commodities];
                            newCommodities[index] = { ...commodity, stacking_height: parseFloat(e.target.value) };
                            handleInputChange('expected_commodities', newCommodities);
                          }}
                          className={inputStyles}
                          placeholder="Enter stacking height in meters"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`expected_commodities.${index}.storage_type`}>Storage Type</Label>
                        <select
                          id={`expected_commodities.${index}.storage_type`}
                          value={commodity.storage_type}
                          onChange={(e) => {
                            const newCommodities = [...formData.expected_commodities];
                            newCommodities[index] = { ...commodity, storage_type: e.target.value };
                            handleInputChange('expected_commodities', newCommodities);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select storage type</option>
                          <option value="Pallet Rack">Pallet Rack</option>
                          <option value="Shelving">Shelving</option>
                          <option value="Bulk Storage">Bulk Storage</option>
                          <option value="Bin Storage">Bin Storage</option>
                          <option value="Floor Stack">Floor Stack</option>
                          <option value="Mezzanine">Mezzanine</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newCommodities = [...formData.expected_commodities, {
                    name: '',
                    category: '',
                    stacking_height: 0,
                    storage_type: ''
                  }];
                  handleInputChange('expected_commodities', newCommodities);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Commodity</span>
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Special Risks</h4>
            </div>
            
            <div className="space-y-4">
              {formData.special_risks.map((risk, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex-1 flex items-center justify-between"
                      onClick={() => toggleSection(`special_risk_${index}`)}
                    >
                      <span className="font-medium">Risk {index + 1}</span>
                      {expandedSections[`special_risk_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('special_risks', index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {expandedSections[`special_risk_${index}`] && (
                    <div className="space-y-4">
                    <div>
                      <Label htmlFor={`risk_type_${index}`}>Risk Type</Label>
                      <select
                        id={`risk_type_${index}`}
                        value={risk.risk_type}
                        onChange={(e) => {
                          const newRisks = [...formData.special_risks];
                          newRisks[index] = { ...risk, risk_type: e.target.value };
                          handleInputChange('special_risks', newRisks);
                        }}
                          className={inputStyles}
                      >
                        <option value="">Select Risk Type</option>
                          <option value="diesel_tank">Diesel Tank</option>
                          <option value="transformer">Transformer</option>
                          <option value="inverter_battery_rooms">Inverter & Battery rooms</option>
                          <option value="idle_pallets">Idle palletes storage (most common)</option>
                          <option value="substations">Substations</option>
                          <option value="oil_tanks">Oil Tanks</option>
                          <option value="generator">Generator</option>
                          <option value="mezannine">Mezannine</option>
                          <option value="decommissioned_tanks">Decommissioned tanks</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`location_${index}`}>Location</Label>
                      <input
                        type="text"
                        id={`location_${index}`}
                        value={risk.location}
                        onChange={(e) => {
                          const newRisks = [...formData.special_risks];
                          newRisks[index] = { ...risk, location: e.target.value };
                          handleInputChange('special_risks', newRisks);
                        }}
                          className={inputStyles}
                        placeholder="Enter risk location"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`details_${index}`}>Details</Label>
                      <textarea
                        id={`details_${index}`}
                        value={risk.details}
                        onChange={(e) => {
                          const newRisks = [...formData.special_risks];
                          newRisks[index] = { ...risk, details: e.target.value };
                          handleInputChange('special_risks', newRisks);
                        }}
                          className={inputStyles}
                        placeholder="Enter risk details"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Photo Upload (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                        {risk.photo_url ? (
                          <div className="relative">
                            <img
                              src={risk.photo_url}
                              alt={`Risk ${index + 1} photo`}
                                className="w-32 h-32 object-cover rounded-2xl"
                            />
                            <button
                              onClick={() => {
                                const newRisks = [...formData.special_risks];
                                newRisks[index] = { ...risk, photo_url: undefined };
                                handleInputChange('special_risks', newRisks);
                              }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                            <button
                              onClick={() => {
                                // Add file upload logic here
                                    const newRisks = [...formData.special_risks];
                                newRisks[index] = { ...risk, photo_url: 'placeholder.jpg' };
                                    handleInputChange('special_risks', newRisks);
                              }}
                              className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
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

            <button
              onClick={() => {
                handleArrayAdd('special_risks', {
                  risk_type: '',
                  location: '',
                  details: '',
                  photo_url: undefined
                });
              }}
              className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Special Risk</span>
            </button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            {/* Occupancy Separation */}
            <div className="space-y-2">
              <h4 className="font-medium">Occupancy Separation</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="occupancy_separations_separation_type">Type</Label>
                    <select
                      id="occupancy_separations_separation_type"
                      value={formData.occupancy_separations.separation_type}
                      onChange={(e) => handleInputChange('occupancy_separations', {
                        ...formData.occupancy_separations,
                        separation_type: e.target.value
                      })}
                      className={inputStyles}
                    >
                      <option value="">Select type</option>
                      <option value="fire_rated_walls">Fire Rated Walls</option>
                      <option value="fire_rated_doors">Fire Rated Doors</option>
                      <option value="fire_rated_ceilings">Fire Rated Ceilings</option>
                      <option value="fire_rated_floors">Fire Rated Floors</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="occupancy_separations_rating">Fire Rating (minutes)</Label>
                    <Input
                      type="number"
                      id="occupancy_separations_rating"
                      value={formData.occupancy_separations.rating}
                      onChange={(e) => handleInputChange('occupancy_separations', {
                        ...formData.occupancy_separations,
                        rating: parseInt(e.target.value)
                      })}
                      className={inputStyles}
                      min="0"
                      step="30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divisional Separation */}
            <div className="space-y-2">
              <h4 className="font-medium">Divisional Separation</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fire_rated_walls"
                      checked={formData.divisional_separations.fire_rated_walls}
                      onChange={(e) => handleInputChange('divisional_separations', {
                        ...formData.divisional_separations,
                        fire_rated_walls: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="fire_rated_walls">Fire Rated Walls</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fire_rated_doors"
                      checked={formData.divisional_separations.fire_rated_doors}
                      onChange={(e) => handleInputChange('divisional_separations', {
                        ...formData.divisional_separations,
                        fire_rated_doors: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="fire_rated_doors">Fire Rated Doors</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Automatic Fire Extinguishment Areas Section */}
            <div className="space-y-2">
              <Label htmlFor="automatic_fire_extinguishment_areas">Automatic Fire Extinguishment Areas</Label>
              {formData.automatic_fire_extinguishment_areas.map((area, index) => (
                <div key={index} className={cardStyles}>
                    <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`automatic_fire_extinguishment_areas.${index}.name`}>Area Name</Label>
                        <Input
                          type="text"
                        id={`automatic_fire_extinguishment_areas.${index}.name`}
                          value={area.name}
                        onChange={(e) => handleArrayChange('automatic_fire_extinguishment_areas', index, { ...area, name: e.target.value })}
                          className={inputStyles}
                        placeholder="Enter area name"
                        />
                      </div>
                    <div className="space-y-2">
                      <Label htmlFor={`automatic_fire_extinguishment_areas.${index}.commodity_name`}>Commodity</Label>
                        <select
                        id={`automatic_fire_extinguishment_areas.${index}.commodity_name`}
                        value={area.commodity_name}
                        onChange={(e) => handleArrayChange('automatic_fire_extinguishment_areas', index, { ...area, commodity_name: e.target.value })}
                          className={inputStyles}
                        >
                        <option value="">Select a commodity</option>
                        {formData.expected_commodities.map((commodity, idx) => (
                          <option key={idx} value={commodity.name}>
                            {commodity.name}
                          </option>
                        ))}
                        </select>
                      {area.commodity_name && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                          <h4 className="font-medium text-sm mb-3">Commodity Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Category</p>
                              <p className="font-medium text-sm">
                                {formData.expected_commodities.find(c => c.name === area.commodity_name)?.category || 'N/A'}
                              </p>
                      </div>
                      <div>
                              <p className="text-sm text-muted-foreground">Storage Type</p>
                              <p className="font-medium text-sm">
                                {formData.expected_commodities.find(c => c.name === area.commodity_name)?.storage_type || 'N/A'}
                              </p>
                      </div>
                      <div>
                              <p className="text-sm text-muted-foreground">Stacking Height</p>
                              <p className="font-medium text-sm">
                                {formData.expected_commodities.find(c => c.name === area.commodity_name)?.stacking_height || 'N/A'} m
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`automatic_fire_extinguishment_areas.${index}.maximum_stacking_height`}>Maximum Stacking Height (m)</Label>
                        <Input
                          type="number"
                        id={`automatic_fire_extinguishment_areas.${index}.maximum_stacking_height`}
                        value={area.maximum_stacking_height}
                        onChange={(e) => handleArrayChange('automatic_fire_extinguishment_areas', index, { ...area, maximum_stacking_height: parseFloat(e.target.value) })}
                          className={inputStyles}
                        placeholder="Enter maximum stacking height"
                          step="0.1"
                        />
                      </div>
                    </div>
                </div>
              ))}
              <button
                onClick={() => handleArrayAdd('automatic_fire_extinguishment_areas', { name: '', commodity_name: '', maximum_stacking_height: 0 })}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Area</span>
              </button>
            </div>

            {/* Escape Routes */}
            <div className="space-y-4">
              <h4 className="font-medium">Escape Routes</h4>
              {formData.escape_routes.map((route, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`route_${index}`)}
                    >
                      <span className="font-medium">{route.name || `Route ${index + 1}`}</span>
                      {expandedSections[`route_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('escape_routes', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`route_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`route_${index}_name`}>Route Name</Label>
                        <Input
                          type="text"
                          id={`route_${index}_name`}
                          value={route.name}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes];
                            newRoutes[index] = { ...route, name: e.target.value };
                            handleInputChange('escape_routes', newRoutes);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`route_${index}_travel_distance`}>Travel Distance (m)</Label>
                        <Input
                          type="number"
                          id={`route_${index}_travel_distance`}
                          value={route.travel_distance}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes];
                            newRoutes[index] = { ...route, travel_distance: parseFloat(e.target.value) };
                            handleInputChange('escape_routes', newRoutes);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`route_${index}_width`}>Width (m)</Label>
                        <Input
                          type="number"
                          id={`route_${index}_width`}
                          value={route.width}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes];
                            newRoutes[index] = { ...route, width: parseFloat(e.target.value) };
                            handleInputChange('escape_routes', newRoutes);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newRoutes = [...formData.escape_routes, {
                    name: '',
                    travel_distance: 0,
                    width: 0
                  }];
                  handleInputChange('escape_routes', newRoutes);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Escape Route</span>
              </button>
            </div>

            {/* Emergency Staircases */}
            <div className="space-y-4">
              <h4 className="font-medium">Emergency Staircases</h4>
              {formData.emergency_staircases.map((staircase, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`staircase_${index}`)}
                    >
                      <span className="font-medium">{staircase.name || `Staircase ${index + 1}`}</span>
                      {expandedSections[`staircase_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('emergency_staircases', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`staircase_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`staircase_${index}_name`}>Staircase Name</Label>
                        <Input
                          type="text"
                          id={`staircase_${index}_name`}
                          value={staircase.name}
                          onChange={(e) => {
                            const newStaircases = [...formData.emergency_staircases];
                            newStaircases[index] = { ...staircase, name: e.target.value };
                            handleInputChange('emergency_staircases', newStaircases);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency_staircase_${index}_width`}>Width (m)</Label>
                        <Input
                          type="number"
                          id={`emergency_staircase_${index}_width`}
                          value={staircase.width}
                          onChange={(e) => {
                            const newStaircases = [...formData.emergency_staircases];
                            newStaircases[index] = { ...staircase, width: parseFloat(e.target.value) };
                            handleInputChange('emergency_staircases', newStaircases);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`emergency_staircase_${index}_fire_rated`}
                          checked={staircase.fire_rated}
                          onChange={(e) => {
                            const newStaircases = [...formData.emergency_staircases];
                            newStaircases[index] = { ...staircase, fire_rated: e.target.checked };
                            handleInputChange('emergency_staircases', newStaircases);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`emergency_staircase_${index}_fire_rated`}>Fire Rated</Label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newStaircases = [...formData.emergency_staircases, {
                    name: '',
                    width: 0,
                    fire_rating: 0,
                    fire_rated: false
                  }];
                  handleInputChange('emergency_staircases', newStaircases);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Emergency Staircase</span>
              </button>
            </div>

            {/* Signage */}
            <div className="space-y-4">
              <h4 className="font-medium">Signage</h4>
              {formData.signage_items.map((sign, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`sign_${index}`)}
                    >
                      <span className="font-medium">{sign.sign_type || `Sign ${index + 1}`}</span>
                      {expandedSections[`sign_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('signage_items', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`sign_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`sign_${index}_sign_type`}>Sign Type</Label>
                        <select
                          id={`sign_${index}_sign_type`}
                          value={sign.sign_type}
                          onChange={(e) => {
                            const newSigns = [...formData.signage_items];
                            newSigns[index] = { ...sign, sign_type: e.target.value };
                            handleInputChange('signage_items', newSigns);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select sign type</option>
                          <option value="exit">Exit</option>
                          <option value="fire_extinguisher">Fire Extinguisher</option>
                          <option value="fire_hose_reel">Fire Hose Reel</option>
                          <option value="fire_alarm">Fire Alarm</option>
                          <option value="emergency_lighting">Emergency Lighting</option>
                          <option value="assembly_point">Assembly Point</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`sign_${index}_location`}>Location</Label>
                        <Input
                          type="text"
                          id={`sign_${index}_location`}
                          value={sign.location}
                          onChange={(e) => {
                            const newSigns = [...formData.signage_items];
                            newSigns[index] = { ...sign, location: e.target.value };
                            handleInputChange('signage_items', newSigns);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`signage_${index}_photoluminescent`}
                          checked={sign.photoluminescent === 'Yes'}
                          onChange={(e) => {
                            const newSignage = [...formData.signage_items];
                            newSignage[index] = { ...sign, photoluminescent: e.target.checked ? 'Yes' : 'No' };
                            handleInputChange('signage_items', newSignage);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`signage_${index}_photoluminescent`}>Photoluminescent</Label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newSigns = [...formData.signage_items, {
                    sign_type: '',
                    location: '',
                    photoluminescent: ''
                  }];
                  handleInputChange('signage_items', newSigns);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Sign</span>
              </button>
            </div>

            {/* Emergency Lighting */}
            <div className="space-y-4">
              <h4 className="font-medium">Emergency Lighting</h4>
              {formData.emergency_lighting_zones.map((zone, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`lighting_${index}`)}
                    >
                      <span className="font-medium">{zone.name || `Zone ${index + 1}`}</span>
                      {expandedSections[`lighting_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('emergency_lighting_zones', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`lighting_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`lighting_${index}_name`}>Zone Name</Label>
                        <Input
                          type="text"
                          id={`lighting_${index}_name`}
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting_zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            handleInputChange('emergency_lighting_zones', newZones);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lighting_${index}_duration`}>Duration (hours)</Label>
                        <Input
                          type="number"
                          id={`lighting_${index}_duration`}
                          value={zone.duration}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting_zones];
                            newZones[index] = { ...zone, duration: parseFloat(e.target.value) };
                            handleInputChange('emergency_lighting_zones', newZones);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lighting_${index}_lux_level`}>Lux Level</Label>
                        <Input
                          type="number"
                          id={`lighting_${index}_lux_level`}
                          value={zone.lux_level}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting_zones];
                            newZones[index] = { ...zone, lux_level: parseFloat(e.target.value) };
                            handleInputChange('emergency_lighting_zones', newZones);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newZones = [...formData.emergency_lighting_zones, {
                    name: '',
                    duration: 0,
                    lux_level: 0
                  }];
                  handleInputChange('emergency_lighting_zones', newZones);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Lighting Zone</span>
              </button>
            </div>

            {/* Fire Hose Reels */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Hose Reels</h4>
              {formData.fire_hose_reels.map((reel, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`reel_${index}`)}
                    >
                      <span className="font-medium">{reel.location || `Reel ${index + 1}`}</span>
                      {expandedSections[`reel_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('fire_hose_reels', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`reel_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`reel_${index}_location`}>Location</Label>
                        <Input
                          type="text"
                          id={`reel_${index}_location`}
                          value={reel.location}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, location: e.target.value };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reel_${index}_hose_length`}>Hose Length (m)</Label>
                        <Input
                          type="number"
                          id={`reel_${index}_hose_length`}
                          value={reel.hose_length}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, hose_length: parseFloat(e.target.value) };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reel_${index}_coverage_radius`}>Coverage Radius (m)</Label>
                        <Input
                          type="number"
                          id={`reel_${index}_coverage_radius`}
                          value={reel.coverage_radius}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, coverage_radius: parseFloat(e.target.value) };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newReels = [...formData.fire_hose_reels, {
                    location: '',
                    hose_length: 0,
                    coverage_radius: 0
                  }];
                  handleInputChange('fire_hose_reels', newReels);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Hose Reel</span>
              </button>
            </div>

            {/* Fire Extinguishers */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Extinguishers</h4>
              {formData.fire_extinguishers.map((extinguisher, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`extinguisher_${index}`)}
                    >
                      <span className="font-medium">{extinguisher.extinguisher_type || `Extinguisher ${index + 1}`}</span>
                      {expandedSections[`extinguisher_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('fire_extinguishers', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`extinguisher_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`extinguisher_${index}_extinguisher_type`}>Type</Label>
                        <select
                          id={`extinguisher_${index}_type`}
                          value={extinguisher.extinguisher_type}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, extinguisher_type: e.target.value };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select type</option>
                          <option value="water">Water</option>
                          <option value="foam">Foam</option>
                          <option value="dry_powder">Dry Powder</option>
                          <option value="co2">CO2</option>
                          <option value="wet_chemical">Wet Chemical</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`extinguisher_${index}_location`}>Location</Label>
                        <Input
                          type="text"
                          id={`extinguisher_${index}_location`}
                          value={extinguisher.location}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, location: e.target.value };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`extinguisher_${index}_capacity`}>Capacity (kg)</Label>
                        <Input
                          type="number"
                          id={`extinguisher_${index}_capacity`}
                          value={extinguisher.capacity}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, capacity: parseFloat(e.target.value) };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newExtinguishers = [...formData.fire_extinguishers, {
                    extinguisher_type: '',
                    location: '',
                    capacity: 0
                  }];
                  handleInputChange('fire_extinguishers', newExtinguishers);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Extinguisher</span>
              </button>
            </div>

            {/* Fire Hydrants */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Hydrants</h4>
              {formData.fire_hydrants.map((hydrant, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`hydrant_${index}`)}
                    >
                      <span className="font-medium">{hydrant.location || `Hydrant ${index + 1}`}</span>
                      {expandedSections[`hydrant_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('fire_hydrants', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`hydrant_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`hydrant_${index}_location`}>Location</Label>
                        <Input
                          type="text"
                          id={`hydrant_${index}_location`}
                          value={hydrant.location}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, location: e.target.value };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`hydrant_${index}_hydrant_type`}>Type</Label>
                        <select
                          id={`hydrant_${index}_hydrant_type`}
                          value={hydrant.hydrant_type}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, hydrant_type: e.target.value };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select type</option>
                          <option value="underground">Underground</option>
                          <option value="pillar">Pillar</option>
                          <option value="wall">Wall</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`hydrant_${index}_flow_rate`}>Flow Rate (L/min)</Label>
                        <Input
                          type="number"
                          id={`hydrant_${index}_flow_rate`}
                          value={hydrant.flow_rate}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, flow_rate: parseFloat(e.target.value) };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newHydrants = [...formData.fire_hydrants, {
                    location: '',
                    hydrant_type: '',
                    flow_rate: 0
                  }];
                  handleInputChange('fire_hydrants', newHydrants);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Hydrant</span>
              </button>
            </div>

            {/* Fire Water */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Water</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="water_source">Water Source</Label>
                    <select
                      id="water_source"
                      value={formData.firewater?.source || ''}
                      onChange={(e) => handleInputChange('firewater', { ...formData.firewater, source: e.target.value })}
                      className={inputStyles}
                    >
                      <option value="">Select water source</option>
                      <option value="municipal">Municipal</option>
                      <option value="storage_tank">Storage Tank</option>
                      <option value="dam">Dam</option>
                      <option value="river">River</option>
                      <option value="borehole">Borehole</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity (kL)</Label>
                    <Input
                      type="number"
                      id="capacity"
                      value={formData.firewater?.capacity || ''}
                      onChange={(e) => handleInputChange('firewater', { ...formData.firewater, capacity: parseFloat(e.target.value) })}
                      className={inputStyles}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pressure">Pressure (kPa)</Label>
                    <Input
                      type="number"
                      id="pressure"
                      value={formData.firewater?.pressure || ''}
                      onChange={(e) => handleInputChange('firewater', { ...formData.firewater, pressure: parseFloat(e.target.value) })}
                      className={inputStyles}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fire Detection & Alarm Systems */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Detection & Alarm Systems</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system_type">System Type</Label>
                    <select
                      id="system_type"
                      value={formData.fire_detection?.system_type || ''}
                      onChange={(e) => handleInputChange('fire_detection', { ...formData.fire_detection, system_type: e.target.value })}
                      className={inputStyles}
                    >
                      <option value="">Select system type</option>
                      <option value="conventional">Conventional</option>
                      <option value="addressable">Addressable</option>
                      <option value="wireless">Wireless</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="number_of_zones">Number of Zones</Label>
                    <Input
                      type="number"
                      id="number_of_zones"
                      value={formData.fire_detection?.number_of_zones || ''}
                      onChange={(e) => handleInputChange('fire_detection', { ...formData.fire_detection, number_of_zones: parseInt(e.target.value) })}
                      className={inputStyles}
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="battery_backup">Battery Backup (hours)</Label>
                    <Input
                      type="number"
                      id="battery_backup"
                      value={formData.fire_detection?.battery_backup || ''}
                      onChange={(e) => handleInputChange('fire_detection', { ...formData.fire_detection, battery_backup: parseFloat(e.target.value) })}
                      className={inputStyles}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fire Alarm Panel & Zones */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Alarm Panel & Zones</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fire_alarm_panel.zone_name">Zone Name</Label>
                    <Input
                      type="text"
                      id="fire_alarm_panel.zone_name"
                      value={formData.fire_alarm_panel.zone_name}
                      onChange={(e) => handleInputChange('fire_alarm_panel', { ...formData.fire_alarm_panel, zone_name: e.target.value })}
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fire_alarm_panel.panel_layout">Layout</Label>
                    <div className="flex items-center space-x-4">
                      {formData.fire_alarm_panel?.panel_layout ? (
                        <div className="relative">
                          <img
                            src={formData.fire_alarm_panel.panel_layout}
                            alt="Panel Layout"
                            className="w-32 h-32 object-cover rounded-2xl"
                          />
                          <button
                            onClick={() => handleInputChange('fire_alarm_panel', { ...formData.fire_alarm_panel, panel_layout: '' })}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            // Add file upload logic here
                            handleInputChange('fire_alarm_panel', { ...formData.fire_alarm_panel, panel_layout: 'placeholder.jpg' });
                          }}
                          className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <Upload className="w-8 h-8" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smoke Ventilation */}
            <div className="space-y-4">
              <h4 className="font-medium">Smoke Ventilation</h4>
              {formData.smoke_ventilation_zones.map((zone, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`ventilation_${index}`)}
                    >
                      <span className="font-medium">{zone.name || `Zone ${index + 1}`}</span>
                      {expandedSections[`ventilation_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleArrayRemove('smoke_ventilation_zones', index)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`ventilation_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`ventilation_${index}_name`}>Zone Name</Label>
                        <Input
                          type="text"
                          id={`ventilation_${index}_name`}
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation_zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            handleInputChange('smoke_ventilation_zones', newZones);
                          }}
                          className={inputStyles}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ventilation_${index}_area`}>Ventilation Area (m²)</Label>
                        <Input
                          type="number"
                          id={`ventilation_${index}_area`}
                          value={zone.area}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation_zones];
                            newZones[index] = { ...zone, area: parseFloat(e.target.value) };
                            handleInputChange('smoke_ventilation_zones', newZones);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ventilation_${index}_ventilation_rate`}>Ventilation Rate (m³/s)</Label>
                        <Input
                          type="number"
                          id={`ventilation_${index}_ventilation_rate`}
                          value={zone.ventilation_rate}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation_zones];
                            newZones[index] = { ...zone, ventilation_rate: parseFloat(e.target.value) };
                            handleInputChange('smoke_ventilation_zones', newZones);
                          }}
                          className={inputStyles}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newZones = [...formData.smoke_ventilation_zones, {
                    name: '',
                    area: 0,
                    ventilation_rate: 0
                  }];
                  handleInputChange('smoke_ventilation_zones', newZones);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Ventilation Zone</span>
              </button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            {/* Project Summary Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Project Summary</h4>
              
              {/* Step 1: Project Setup */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 1: Project Setup</h5>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Report Type</p>
                      <p className="font-medium">{reportTypes.find(t => t.id === formData.reportType)?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company Name</p>
                      <p className="font-medium">{formData.company_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client Name</p>
                      <p className="font-medium">{formData.client_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Facility Process</p>
                      <p className="font-medium">{formData.facility_process || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.facility_location.town && formData.facility_location.province 
                        ? `${formData.facility_location.town}, ${formData.facility_location.province}`
                        : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Construction Year</p>
                      <p className="font-medium">{formData.construction_year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Occupancy Classification */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 2: Occupancy Classification</h5>
                <div className="space-y-4">
                  {formData.buildings.map((building, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-sm text-muted-foreground">Building {index + 1}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{building.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Classification</p>
                          <p className="font-medium">{building.classification || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Floor Area</p>
                          <p className="font-medium">{building.total_building_area ? `${building.total_building_area} m²` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Construction Materials</p>
                          <p className="font-medium">
                            {building.construction_materials ? Object.entries(building.construction_materials)
                              .filter(([_, value]) => value)
                              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                              .join(', ') : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Facility Overview */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 3: Facility Overview</h5>
                <div className="space-y-4">
                  {formData.zones.map((zone, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-sm text-muted-foreground">Zone {index + 1}</p>
                      <p className="font-medium">{zone.name || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">Photos: {zone.photos?.length || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Commodity Classification */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 4: Commodity Classification</h5>
                <div className="space-y-4">
                  {formData.expected_commodities.map((commodity, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Commodity Name</p>
                          <p className="font-medium">{commodity.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Category</p>
                          <p className="font-medium">{commodity.category || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Stacking Height</p>
                          <p className="font-medium">{commodity.stacking_height ? `${commodity.stacking_height} m` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Storage Type</p>
                          <p className="font-medium">{commodity.storage_type || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 5: Special Risks */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 5: Special Risks</h5>
                <div className="space-y-4">
                  {formData.special_risks.map((risk, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Type</p>
                          <p className="font-medium">{risk.risk_type || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{risk.location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 6: Fire Protection Systems */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 6: Fire Protection Systems</h5>
                <div className="space-y-4">
                  {/* Fire Alarm System */}
                  <div>
                    <p className="text-sm text-muted-foreground">Fire Alarm System</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">System Type</p>
                        <p className="font-medium">{formData.fire_detection.system_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Number of Zones</p>
                        <p className="font-medium">{formData.fire_detection.number_of_zones || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fire Extinguishers */}
                  <div>
                    <p className="text-sm text-muted-foreground">Fire Extinguishers</p>
                    <p className="font-medium">{formData.fire_extinguishers.length} units</p>
                  </div>

                  {/* Fire Hose Reels */}
                  <div>
                    <p className="text-sm text-muted-foreground">Fire Hose Reels</p>
                    <p className="font-medium">{formData.fire_hose_reels.length} units</p>
                  </div>

                  {/* Fire Hydrants */}
                  <div>
                    <p className="text-sm text-muted-foreground">Fire Hydrants</p>
                    <p className="font-medium">{formData.fire_hydrants.length} units</p>
                  </div>

                  {/* Smoke Ventilation */}
                  <div>
                    <p className="text-sm text-muted-foreground">Smoke Ventilation Zones</p>
                    <p className="font-medium">{formData.smoke_ventilation_zones.length} zones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                  <button
                onClick={prevStep}
                className={`${buttonStyles} btn-secondary`}
                  >
                Previous
                  </button>
                      <button
                onClick={handleSubmit}
                className={`${buttonStyles} btn-primary`}
              >
                View Project
                      </button>
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