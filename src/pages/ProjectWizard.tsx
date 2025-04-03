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

// Corresponds to report_types table
interface ReportType {
  id: string;
  name: string;
  description: string;
}

// (Keep your existing reportTypes array as it matches the interface)
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


// Corresponds to facility_locations table
interface FacilityLocation {
    id?: number; // Optional: only present for existing records
    project_id?: number; // Optional: only needed if managing relations explicitly
    town: string;
    province: string;
}

// Corresponds to building_construction_materials table
interface BuildingConstructionMaterials {
    building_id?: number; // Optional: only needed if managing relations explicitly
    brick: boolean;
    steel: boolean;
    concrete: boolean;
    timber: boolean;
    other_description: string | null; // Renamed from 'other', type TEXT -> string | null
}

// Corresponds to buildings table
interface Building {
    id?: number; // Optional: only present for existing records
    project_id?: number; // Optional: only needed if managing relations explicitly
    name: string;
    classification: string | null; // Nullable
    total_building_area: number | null; // Renamed from total_floor_area, nullable
    cad_drawing: string | null; // Nullable
    aerial_view: string | null; // Nullable
    // Nested construction materials directly for convenience, maps to separate table
    construction_materials: BuildingConstructionMaterials;
    // Removed: floor_plan, sans_10400_t_table, fire_load
}

// Corresponds to expected_commodities table
interface ExpectedCommodity {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    category: string | null;
    stacking_height: number | null; // Assuming meters
    storage_type: string | null;
}

// Corresponds to zone_photos table
interface ZonePhoto {
    id?: number; // Optional
    zone_id?: number; // Optional
    photo_url: string;
    description?: string | null; // Optional description added in SQL
}

// Corresponds to zones table
interface Zone {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    // Nested photos directly for convenience, maps to separate table
    photos: ZonePhoto[]; // Updated structure
}

// Corresponds to special_risks table
interface SpecialRisk {
    id?: number; // Optional
    project_id?: number; // Optional
    risk_type: string; // Renamed from 'type'
    location: string;
    details: string | null; // Nullable
    photo: string | null; // Nullable
}

// Corresponds to divisional_separations table (1-to-1 with project)
interface DivisionalSeparation {
    project_id?: number; // Optional
    fire_rated_walls: boolean;
    fire_rated_doors: boolean;
    details: string | null; // Added in SQL, replaced separation_plan, penetrations
}

// Corresponds to fire_alarm_panel table (1-to-1 with project)
interface FireAlarmPanel {
    project_id?: number; // Optional
    panel_layout: string | null; // Nullable
    panel_location: string | null; // Added in SQL
    zone_description: string | null; // Added in SQL, replaced sprinkler_zones, hydrant_locations
}

// Corresponds to escape_routes table
interface EscapeRoute {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    travel_distance: number | null; // Nullable
    width: number | null; // Nullable
}

// Corresponds to emergency_staircases table
interface EmergencyStaircase {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    width: number | null; // Nullable
    fire_rated: boolean;
}

// Corresponds to signage_items table
interface SignageItem {
    id?: number; // Optional
    project_id?: number; // Optional
    sign_type: string; // Renamed from 'type'
    location: string;
    photoluminescent: boolean;
}

// Corresponds to emergency_lighting_zones table
interface EmergencyLightingZone {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    duration: number | null; // Duration in minutes, nullable
    lux_level: number | null; // Nullable
}

// Corresponds to fire_hose_reels table
interface FireHoseReel {
    id?: number; // Optional
    project_id?: number; // Optional
    location: string;
    hose_length: number | null; // Nullable
    coverage_radius: number | null; // Nullable
}

// Corresponds to fire_extinguishers table
interface FireExtinguisher {
    id?: number; // Optional
    project_id?: number; // Optional
    extinguisher_type: string; // Renamed from 'type'
    location: string;
    capacity: number | null; // Nullable
    capacity_unit: string | null; // Added in SQL, nullable
}

// Corresponds to fire_hydrants table
interface FireHydrant {
    id?: number; // Optional
    project_id?: number; // Optional
    location: string;
    hydrant_type: string | null; // Renamed from 'type', nullable
    flow_rate: number | null; // Nullable
    flow_rate_unit: string | null; // Added in SQL, nullable
}

// Corresponds to firewater table (1-to-1 with project)
interface Firewater {
    project_id?: number; // Optional
    source: string;
    capacity: number | null; // Nullable
    capacity_unit: string | null; // Added in SQL, nullable
    pressure: number | null; // Nullable
    pressure_unit: string | null; // Added in SQL, nullable
}

// Corresponds to fire_detection table (1-to-1 with project)
interface FireDetection {
    project_id?: number; // Optional
    system_type: string; // Renamed from 'type'
    number_of_zones: number | null; // Renamed from 'zones', nullable
    battery_backup: number | null; // Duration in hours, nullable
}

// Corresponds to smoke_ventilation_zones table
interface SmokeVentilationZone {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    area: number | null; // Nullable
    ventilation_rate: number | null; // Nullable
    ventilation_rate_unit: string | null; // Added in SQL, nullable
}

// Corresponds to project_actions table (consolidated mandatory/optional)
interface ProjectAction {
    id?: number; // Optional
    project_id?: number; // Optional
    action_type: 'mandatory' | 'optional';
    action_description: string;
    priority?: number | null; // Optional field added in SQL
    status?: 'outstanding' | 'in_progress' | 'completed' | 'waived'; // Optional field added in SQL
}

// Corresponds to engineer_signoffs table (1-to-1 with project)
interface EngineerSignoff {
    project_id?: number; // Optional
    engineer_name: string; // Renamed from 'name'
    ecsa_number: string;
    signature_url: string | null; // Renamed from 'signature', nullable
    signoff_date?: Date; // Added in SQL, use Date type, optional as DB might set default
}

// Corresponds to occupancy_separations table (1-to-1 with project)
interface OccupancySeparation {
    project_id?: number; // Optional
    separation_type: string; // Renamed from 'type'
    required_rating: number | null; // Renamed from 'rating', nullable (rating in minutes)
}

// Corresponds to automatic_fire_extinguishment_areas table
interface AutomaticFireExtinguishmentArea {
    id?: number; // Optional
    project_id?: number; // Optional
    name: string;
    system_type: string | null; // Added in SQL, nullable
    commodity: string | null; // Nullable
    category: string | null; // Nullable
    storage_type: string | null; // Nullable
    max_design_stacking_height: number | null; // Renamed from max_stacking_height, nullable
    current_stacking_height: number | null; // Nullable
}

// --- Main Project Data Interface ---
// Corresponds largely to the projects table, embedding related data arrays/objects
interface ProjectData {
    id?: number; // Optional: from projects table
    reportType: string; // from projects.report_type
    name: string; // Assuming a name for the project itself is needed - ADD to SQL projects.name?
    clientName: string; // from projects.client_name
    description: string | null; // Project description - ADD to SQL projects.description? nullable
    // start_date, end_date removed - not in refined SQL
    status: 'active' | 'completed' | 'archived' | 'pending'; // from projects.status
    // company_id removed - not in refined SQL
    companyName: string | null; // from projects.company_name, nullable
    facility_process: string | null; // from projects.facility_process, nullable
    construction_year: number | null; // from projects.construction_year, nullable
    created_at?: Date; // Optional: from projects.created_at
    updated_at?: Date; // Optional: from projects.updated_at

    // --- Related Data (Arrays for one-to-many, Objects for one-to-one) ---
    facility_locations: FacilityLocation[]; // Changed from single object
    buildings: Building[];
    expected_commodities: ExpectedCommodity[]; // Replaces 'storage_details'
    zones: Zone[];
    special_risks: SpecialRisk[];
    divisional_separation: DivisionalSeparation | null; // Can be null if not applicable/entered
    fire_alarm_panel: FireAlarmPanel | null; // Renamed, Can be null
    escape_routes: EscapeRoute[]; // Changed from nested structure
    emergency_staircases: EmergencyStaircase[];
    signage_items: SignageItem[]; // Renamed from signage.items
    emergency_lighting_zones: EmergencyLightingZone[]; // Renamed from emergency_lighting.zones
    fire_hose_reels: FireHoseReel[];
    fire_extinguishers: FireExtinguisher[];
    fire_hydrants: FireHydrant[];
    firewater: Firewater | null; // Can be null
    fire_detection: FireDetection | null; // Can be null
    smoke_ventilation_zones: SmokeVentilationZone[]; // Renamed from smoke_ventilation.zones
    project_actions: ProjectAction[]; // Replaces mandatory/optional actions
    engineer_signoff: EngineerSignoff | null; // Can be null
    occupancy_separation: OccupancySeparation | null; // Renamed, can be null
    automatic_fire_extinguishment_areas: AutomaticFireExtinguishmentArea[]; // Renamed from automatic_fire_extinguishment.areas

    // Removed: storage_details, electrical, separation_requirements
}

// --- Updated Component ---

// Placeholder hooks - replace with your actual implementations
const useUser = () => ({ userDetails: { company: 'some-company-id' } });
const useProjects = () => ({ refreshProjects: () => console.log("Refreshing projects...") });


const ProjectWizard = () => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  const { refreshProjects } = useProjects();
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 7; // Adjust as needed
  const [loading, setLoading] = useState(false);
  // State for UI control - keeping these as they seem UI-specific
  const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);
  const [selectedSansDoc, setSelectedSansDoc] = useState<string>("10400-T");
  const [showSansSelector, setShowSansSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    // Update keys if section names changed, otherwise keep for UI state
     zones: true,
     expected_commodities: true, // Changed from storage_details
     // sprinkler_zones is removed from fire_alarm
     // hydrant_locations is removed from fire_alarm
     emergency_lighting_zones: true, // Key matches new top-level array name
     // door_rotation_diagrams seems UI specific, maybe relates to escape routes or buildings? Keep for now.
     door_rotation_diagrams: true,
     project_actions: true, // Changed from mandatory/optional actions
  });

  // Initialize formData according to the updated ProjectData interface
  const [formData, setFormData] = React.useState<ProjectData>({
    reportType: "", // Will be selected from reportTypes
    name: '', // Project name
    clientName: '',
    description: null,
    status: 'active', // Default status
    // company_id removed
    companyName: '', // Set based on userDetails or selection later?
    facility_process: null,
    construction_year: null,
    // Initialize arrays and nullable objects
    facility_locations: [], // Was facility_location object
    buildings: [],
    expected_commodities: [], // Was storage_details
    zones: [],
    special_risks: [],
    divisional_separation: null, // Initialize as null
    fire_alarm_panel: null, // Initialize as null
    escape_routes: [], // Was nested object
    emergency_staircases: [],
    signage_items: [], // Was nested signage.items
    emergency_lighting_zones: [], // Was nested emergency_lighting.zones
    fire_hose_reels: [],
    fire_extinguishers: [],
    fire_hydrants: [],
    firewater: null, // Initialize as null
    fire_detection: null, // Initialize as null
    smoke_ventilation_zones: [], // Was nested smoke_ventilation.zones
    project_actions: [], // Replaces mandatory_actions/optional_actions arrays
    engineer_signoff: null, // Initialize as null
    occupancy_separation: null, // Initialize as null
    automatic_fire_extinguishment_areas: [], // Was nested automatic_fire_extinguishment.areas
  });

  // --- Rest of your component logic (handlers, JSX, etc.) ---
  // Remember to update your input field names/bindings (`onChange` handlers, etc.)
  // to match the new `formData` structure and field names (e.g., use `clientName` instead of `client_name`)


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        // Handle nested updates (e.g., 'fire_alarm.panel_layout')
        const [parent, child] = field.split('.');
        const parentObj = prev[parent as keyof ProjectData] as Record<string, any>;
        return {
      ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      } else {
        // Handle direct updates
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => i === index ? value : item)
    }));
  };

  const handleArrayAdd = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      // Add your save draft logic here
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
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
    setLoading(true);

    try {
      // Create project in Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            name: formData.company_name,
            client_name: formData.client_name,
            facility_process: formData.facility_process,
            facility_location: formData.facility_location,
            construction_year: formData.construction_year,
            divisional_separation: formData.divisional_separation,
            fire_alarm: formData.fire_alarm,
            mandatory_actions: formData.mandatory_actions,
            optional_actions: formData.optional_actions,
            user_id: userDetails?.id,
            status: 'active',
            report_type: formData.reportType
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Generate text file content
      const fileContent = `Project Information
===================

Basic Information
----------------
Company Name: ${formData.company_name}
Client Name: ${formData.client_name}
Facility Process: ${formData.facility_process}
Location: ${formData.facility_location.town}, ${formData.facility_location.province}
Construction Year: ${formData.construction_year}

Divisional Separation
-------------------
Fire Rated Walls: ${formData.divisional_separation.fire_rated_walls ? 'Yes' : 'No'}
Fire Rated Doors: ${formData.divisional_separation.fire_rated_doors ? 'Yes' : 'No'}
Penetrations: ${formData.divisional_separation.penetrations ? 'Yes' : 'No'}
Separation Plan: ${formData.divisional_separation.separation_plan || 'Not uploaded'}

Fire Alarm System
----------------
Panel Layout: ${formData.fire_alarm.panel_layout || 'Not uploaded'}
Sprinkler Zones: ${formData.fire_alarm.sprinkler_zones.join(', ') || 'None specified'}
Hydrant Locations: ${formData.fire_alarm.hydrant_locations.join(', ') || 'None specified'}

Mandatory Actions
----------------
${formData.mandatory_actions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

Optional Actions
---------------
${formData.optional_actions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
`;

      // Create and save the file
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project_info.txt`);

      // Refresh projects list
      await refreshProjects();

      // Show success message
      toast.success('Project created successfully');

      // Navigate to project details
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
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
                        <Label htmlFor={`buildings.${index}.total_floor_area`}>Total Building Area (m²)</Label>
                        <Input
                          type="number"
                          value={building.total_floor_area}
                          onChange={(e) => handleArrayChange('buildings', index, { ...building, total_floor_area: parseFloat(e.target.value) })}
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
                  total_floor_area: 0,
                  floor_plan: '',
                  cad_drawing: '',
                  sans_10400_t_table: '',
                  fire_load: {
                    commodities: [],
                    total_timber_equivalent: 0
                  },
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Summary</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{formData.company_name}</p>
                </div>
                <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{formData.client_name}</p>
                </div>
                <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Facility Process</p>
                <p className="font-medium">{formData.facility_process}</p>
              </div>
                  <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{formData.facility_location.town}, {formData.facility_location.province}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Construction Year</p>
                <p className="font-medium">{formData.construction_year}</p>
              </div>
                    </div>
                    
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
                          name={`zones.${index}.name`}
                          value={zone.name}
                          onChange={(e) => handleArrayChange('zones', index, { ...zone, name: e.target.value })}
                          className={inputStyles}
                          placeholder="Enter zone name"
                        />
                    </div>
                      <div>
                        <Label htmlFor={`zones.${index}.photos`}>Photos</Label>
                        <div className="flex flex-wrap gap-4">
                          {zone.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative">
                              <img src={photo} alt={`Zone ${index + 1} Photo ${photoIndex + 1}`} className="w-32 h-32 object-cover rounded-2xl" />
                              <button
                                onClick={() => {
                                  const newPhotos = zone.photos.filter((_, i) => i !== photoIndex);
                                  handleArrayChange('zones', index, { ...zone, photos: newPhotos });
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                  </div>
                          ))}
                          <button
                            onClick={() => {
                              const newPhotos = [...zone.photos, 'placeholder.jpg'];
                              handleArrayChange('zones', index, { ...zone, photos: newPhotos });
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
                onClick={() => handleArrayAdd('zones', { name: '', photos: [] })}
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
            {/* Expected Commodities Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Expected Commodities</h4>
              {formData.buildings[0]?.fire_load.commodities.map((commodity, index) => (
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
                      onClick={() => {
                        const newCommodities = formData.buildings[0].fire_load.commodities.filter((_, i) => i !== index);
                        handleArrayChange('buildings', 0, {
                          ...formData.buildings[0],
                          fire_load: {
                            ...formData.buildings[0].fire_load,
                            commodities: newCommodities
                          }
                        });
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                </div>
                
                  {expandedSections[`commodity_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`buildings.0.fire_load.commodities.${index}.name`}>Commodity Name</Label>
                        <Input
                          type="text"
                          id={`buildings.0.fire_load.commodities.${index}.name`}
                          value={commodity.name}
                          onChange={(e) => {
                            const newCommodities = [...formData.buildings[0].fire_load.commodities];
                            newCommodities[index] = { ...commodity, name: e.target.value };
                            handleArrayChange('buildings', 0, {
                              ...formData.buildings[0],
                              fire_load: {
                                ...formData.buildings[0].fire_load,
                                commodities: newCommodities
                              }
                            });
                          }}
                          className={inputStyles}
                          placeholder="Enter commodity name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`buildings.0.fire_load.commodities.${index}.category`}>Category</Label>
                        <select
                          id={`buildings.0.fire_load.commodities.${index}.category`}
                          value={commodity.category}
                          onChange={(e) => {
                            const newCommodities = [...formData.buildings[0].fire_load.commodities];
                            newCommodities[index] = { ...commodity, category: e.target.value };
                            handleArrayChange('buildings', 0, {
                              ...formData.buildings[0],
                              fire_load: {
                                ...formData.buildings[0].fire_load,
                                commodities: newCommodities
                              }
                            });
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select category</option>
                          <option value="I">Category I - Low Hazard</option>
                          <option value="II">Category II - Medium Hazard</option>
                          <option value="III">Category III - High Hazard</option>
                          <option value="IV">Category IV - Extra High Hazard</option>
                        </select>
                    </div>
                      <div>
                        <Label htmlFor={`buildings.0.fire_load.commodities.${index}.minimum_stacking_height`}>Stacking Height (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`buildings.0.fire_load.commodities.${index}.minimum_stacking_height`}
                          value={commodity.minimum_stacking_height}
                          onChange={(e) => {
                            const newCommodities = [...formData.buildings[0].fire_load.commodities];
                            newCommodities[index] = { ...commodity, minimum_stacking_height: parseFloat(e.target.value) };
                            handleArrayChange('buildings', 0, {
                              ...formData.buildings[0],
                              fire_load: {
                                ...formData.buildings[0].fire_load,
                                commodities: newCommodities
                              }
                            });
                          }}
                          className={inputStyles}
                          placeholder="Enter stacking height"
                        />
                        {commodity.category && commodity.minimum_stacking_height > 0 && (
                          <div className="mt-2">
                            {(() => {
                              const maxHeights = {
                                'I': 3.0,
                                'II': 2.5,
                                'III': 2.0,
                                'IV': 1.5
                              };
                              const maxHeight = maxHeights[commodity.category as keyof typeof maxHeights];
                              if (commodity.minimum_stacking_height > maxHeight) {
                                return (
                                  <p className="text-sm text-red-500">
                                    Warning: Stacking height exceeds maximum allowed height of {maxHeight}m for Category {commodity.category}
                                  </p>
                                );
                              }
                              return null;
                            })()}
                      </div>
                        )}
                    </div>
                      <div>
                        <Label htmlFor={`buildings.0.fire_load.commodities.${index}.storage_type`}>Storage Type</Label>
                        <select
                          id={`buildings.0.fire_load.commodities.${index}.storage_type`}
                          value={commodity.storage_type}
                          onChange={(e) => {
                            const newCommodities = [...formData.buildings[0].fire_load.commodities];
                            newCommodities[index] = { ...commodity, storage_type: e.target.value };
                            handleArrayChange('buildings', 0, {
                              ...formData.buildings[0],
                              fire_load: {
                                ...formData.buildings[0].fire_load,
                                commodities: newCommodities
                              }
                            });
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select storage type</option>
                          <option value="palletized">Palletized</option>
                          <option value="solid_pile">Solid Pile</option>
                          <option value="shelf_storage">Shelf Storage</option>
                          <option value="rack_storage">Rack Storage</option>
                        </select>
                      </div>
                    </div>
                  )}
                  </div>
              ))}
              <button
                onClick={() => {
                  const newCommodities = [...formData.buildings[0].fire_load.commodities, {
                    name: '',
                    category: '',
                    minimum_stacking_height: 0,
                    storage_type: ''
                  }];
                  handleArrayChange('buildings', 0, {
                    ...formData.buildings[0],
                    fire_load: {
                      ...formData.buildings[0].fire_load,
                      commodities: newCommodities
                    }
                  });
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Expected Commodity</span>
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            {/* Occupancy Separation Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Occupancy Separation</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="occupancy_separation.type">Separation Type</Label>
                    <select
                      id="occupancy_separation.type"
                      value={formData.occupancy_separation.type}
                      onChange={(e) => handleInputChange('occupancy_separation.type', e.target.value)}
                      className={inputStyles}
                    >
                      <option value="">Select separation type</option>
                      <option value="fire_rated_wall">Fire Rated Wall</option>
                      <option value="fire_rated_door">Fire Rated Door</option>
                      <option value="fire_rated_floor">Fire Rated Floor</option>
                      <option value="fire_rated_ceiling">Fire Rated Ceiling</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="occupancy_separation.rating">Fire Rating (hours)</Label>
                    <Input
                      type="number"
                      id="occupancy_separation.rating"
                      value={formData.occupancy_separation.rating}
                      onChange={(e) => handleInputChange('occupancy_separation.rating', parseFloat(e.target.value))}
                      className={inputStyles}
                      placeholder="Enter fire rating"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divisional Separation Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Divisional Separation</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="divisional_separation.fire_rated_walls">Fire Rated Walls</Label>
                      <label className={checkboxWrapperStyles}>
                        <input
                          type="checkbox"
                          id="divisional_separation.fire_rated_walls"
                          checked={formData.divisional_separation.fire_rated_walls}
                          onChange={(e) => handleInputChange('divisional_separation.fire_rated_walls', e.target.checked)}
                          className={checkboxStyles}
                        />
                        <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                          Fire Rated Walls Present
                        </span>
                      </label>
                    </div>
                    <div>
                      <Label htmlFor="divisional_separation.fire_rated_doors">Fire Rated Doors</Label>
                      <label className={checkboxWrapperStyles}>
                        <input
                          type="checkbox"
                          id="divisional_separation.fire_rated_doors"
                          checked={formData.divisional_separation.fire_rated_doors}
                          onChange={(e) => handleInputChange('divisional_separation.fire_rated_doors', e.target.checked)}
                          className={checkboxStyles}
                        />
                        <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                          Fire Rated Doors Present
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Automatic Fire Extinguishment Section - Only shown when no divisional separation */}
            {!formData.divisional_separation.fire_rated_walls && !formData.divisional_separation.fire_rated_doors && (
              <div className="space-y-4">
                <h4 className="font-medium">Automatic Fire Extinguishment</h4>
                {formData.automatic_fire_extinguishment.areas.map((area, index) => (
                  <div key={index} className={cardStyles}>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        className="flex items-center justify-between flex-grow"
                        onClick={() => toggleSection(`fire_extinguishment_${index}`)}
                      >
                        <span className="font-medium">{area.name || `Area ${index + 1}`}</span>
                        {expandedSections[`fire_extinguishment_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          const newAreas = formData.automatic_fire_extinguishment.areas.filter((_, i) => i !== index);
                          handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                        }}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {expandedSections[`fire_extinguishment_${index}`] && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.name`}>Area Name</Label>
                          <Input
                            type="text"
                            id={`automatic_fire_extinguishment.areas.${index}.name`}
                            value={area.name}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, name: e.target.value };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                            placeholder="Enter area name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.commodity`}>Commodity</Label>
                          <Input
                            type="text"
                            id={`automatic_fire_extinguishment.areas.${index}.commodity`}
                            value={area.commodity}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, commodity: e.target.value };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                            placeholder="Enter commodity type"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.category`}>Category</Label>
                          <select
                            id={`automatic_fire_extinguishment.areas.${index}.category`}
                            value={area.category}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, category: e.target.value };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                          >
                            <option value="">Select category</option>
                            <option value="I">Category I - Low Hazard</option>
                            <option value="II">Category II - Medium Hazard</option>
                            <option value="III">Category III - High Hazard</option>
                            <option value="IV">Category IV - Extra High Hazard</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.storage_type`}>Storage Type</Label>
                          <select
                            id={`automatic_fire_extinguishment.areas.${index}.storage_type`}
                            value={area.storage_type}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, storage_type: e.target.value };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                          >
                            <option value="">Select storage type</option>
                            <option value="palletized">Palletized</option>
                            <option value="solid_pile">Solid Pile</option>
                            <option value="shelf_storage">Shelf Storage</option>
                            <option value="rack_storage">Rack Storage</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.max_stacking_height`}>Maximum Stacking Height (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            id={`automatic_fire_extinguishment.areas.${index}.max_stacking_height`}
                            value={area.max_stacking_height}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, max_stacking_height: parseFloat(e.target.value) };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                            placeholder="Enter maximum stacking height"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`automatic_fire_extinguishment.areas.${index}.current_stacking_height`}>Current Stacking Height (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            id={`automatic_fire_extinguishment.areas.${index}.current_stacking_height`}
                            value={area.current_stacking_height}
                            onChange={(e) => {
                              const newAreas = [...formData.automatic_fire_extinguishment.areas];
                              newAreas[index] = { ...area, current_stacking_height: parseFloat(e.target.value) };
                              handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                            }}
                            className={inputStyles}
                            placeholder="Enter current stacking height"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newAreas = [...formData.automatic_fire_extinguishment.areas, {
                      name: '',
                      commodity: '',
                      category: '',
                      storage_type: '',
                      max_stacking_height: 0,
                      current_stacking_height: 0
                    }];
                    handleInputChange('automatic_fire_extinguishment.areas', newAreas);
                  }}
                  className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Fire Extinguishment Area</span>
                </button>
              </div>
            )}

            {/* Escape Routes Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Escape Routes</h4>
              {formData.escape_routes.routes.map((route, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`escape_route_${index}`)}
                    >
                      <span className="font-medium">{route.name || `Route ${index + 1}`}</span>
                      {expandedSections[`escape_route_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newRoutes = formData.escape_routes.routes.filter((_, i) => i !== index);
                        handleInputChange('escape_routes.routes', newRoutes);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`escape_route_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`escape_routes.routes.${index}.name`}>Route Name</Label>
                        <Input
                          type="text"
                          id={`escape_routes.routes.${index}.name`}
                          value={route.name}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes.routes];
                            newRoutes[index] = { ...route, name: e.target.value };
                            handleInputChange('escape_routes.routes', newRoutes);
                          }}
                          className={inputStyles}
                          placeholder="Enter route name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`escape_routes.routes.${index}.travel_distance`}>Travel Distance (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`escape_routes.routes.${index}.travel_distance`}
                          value={route.travel_distance}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes.routes];
                            newRoutes[index] = { ...route, travel_distance: parseFloat(e.target.value) };
                            handleInputChange('escape_routes.routes', newRoutes);
                          }}
                          className={inputStyles}
                          placeholder="Enter travel distance"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`escape_routes.routes.${index}.width`}>Width (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`escape_routes.routes.${index}.width`}
                          value={route.width}
                          onChange={(e) => {
                            const newRoutes = [...formData.escape_routes.routes];
                            newRoutes[index] = { ...route, width: parseFloat(e.target.value) };
                            handleInputChange('escape_routes.routes', newRoutes);
                          }}
                          className={inputStyles}
                          placeholder="Enter route width"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newRoutes = [...formData.escape_routes.routes, {
                    name: '',
                    travel_distance: 0,
                    width: 0
                  }];
                  handleInputChange('escape_routes.routes', newRoutes);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Escape Route</span>
              </button>
            </div>

            {/* Emergency Staircases Section */}
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
                      onClick={() => {
                        const newStaircases = formData.emergency_staircases.filter((_, i) => i !== index);
                        handleInputChange('emergency_staircases', newStaircases);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`staircase_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`emergency_staircases.${index}.name`}>Staircase Name</Label>
                        <Input
                          type="text"
                          id={`emergency_staircases.${index}.name`}
                          value={staircase.name}
                          onChange={(e) => {
                            const newStaircases = [...formData.emergency_staircases];
                            newStaircases[index] = { ...staircase, name: e.target.value };
                            handleInputChange('emergency_staircases', newStaircases);
                          }}
                          className={inputStyles}
                          placeholder="Enter staircase name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency_staircases.${index}.width`}>Width (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`emergency_staircases.${index}.width`}
                          value={staircase.width}
                          onChange={(e) => {
                            const newStaircases = [...formData.emergency_staircases];
                            newStaircases[index] = { ...staircase, width: parseFloat(e.target.value) };
                            handleInputChange('emergency_staircases', newStaircases);
                          }}
                          className={inputStyles}
                          placeholder="Enter staircase width"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency_staircases.${index}.fire_rated`}>Fire Rated</Label>
                        <label className={checkboxWrapperStyles}>
                          <input
                            type="checkbox"
                            id={`emergency_staircases.${index}.fire_rated`}
                            checked={staircase.fire_rated}
                            onChange={(e) => {
                              const newStaircases = [...formData.emergency_staircases];
                              newStaircases[index] = { ...staircase, fire_rated: e.target.checked };
                              handleInputChange('emergency_staircases', newStaircases);
                            }}
                            className={checkboxStyles}
                          />
                          <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                            Fire Rated Staircase
                          </span>
                        </label>
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

            {/* Signage Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Signage</h4>
              {formData.signage.items.map((item, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`signage_${index}`)}
                    >
                      <span className="font-medium">{item.type || `Sign ${index + 1}`}</span>
                      {expandedSections[`signage_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newItems = formData.signage.items.filter((_, i) => i !== index);
                        handleInputChange('signage.items', newItems);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`signage_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`signage.items.${index}.type`}>Sign Type</Label>
                        <select
                          id={`signage.items.${index}.type`}
                          value={item.type}
                          onChange={(e) => {
                            const newItems = [...formData.signage.items];
                            newItems[index] = { ...item, type: e.target.value };
                            handleInputChange('signage.items', newItems);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select sign type</option>
                          <option value="exit">Exit Sign</option>
                          <option value="fire_extinguisher">Fire Extinguisher Sign</option>
                          <option value="fire_hose_reel">Fire Hose Reel Sign</option>
                          <option value="emergency_exit">Emergency Exit Sign</option>
                          <option value="assembly_point">Assembly Point Sign</option>
                          <option value="no_smoking">No Smoking Sign</option>
                          <option value="fire_route">Fire Route Sign</option>
                          <option value="fire_alarm">Fire Alarm Sign</option>
                          <option value="first_aid">First Aid Sign</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`signage.items.${index}.location`}>Location</Label>
                        <Input
                          type="text"
                          id={`signage.items.${index}.location`}
                          value={item.location}
                          onChange={(e) => {
                            const newItems = [...formData.signage.items];
                            newItems[index] = { ...item, location: e.target.value };
                            handleInputChange('signage.items', newItems);
                          }}
                          className={inputStyles}
                          placeholder="Enter sign location"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`signage.items.${index}.photoluminescent`}>Photoluminescent</Label>
                        <label className={checkboxWrapperStyles}>
                          <input
                            type="checkbox"
                            id={`signage.items.${index}.photoluminescent`}
                            checked={item.photoluminescent}
                            onChange={(e) => {
                              const newItems = [...formData.signage.items];
                              newItems[index] = { ...item, photoluminescent: e.target.checked };
                              handleInputChange('signage.items', newItems);
                            }}
                            className={checkboxStyles}
                          />
                          <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                            Photoluminescent Sign
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [...formData.signage.items, {
                    type: '',
                    location: '',
                    photoluminescent: false
                  }];
                  handleInputChange('signage.items', newItems);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Sign</span>
              </button>
            </div>

            {/* Emergency Lighting Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Emergency Lighting</h4>
              {formData.emergency_lighting.zones.map((zone, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`emergency_lighting_${index}`)}
                    >
                      <span className="font-medium">{zone.name || `Zone ${index + 1}`}</span>
                      {expandedSections[`emergency_lighting_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newZones = formData.emergency_lighting.zones.filter((_, i) => i !== index);
                        handleInputChange('emergency_lighting.zones', newZones);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`emergency_lighting_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`emergency_lighting.zones.${index}.name`}>Zone Name</Label>
                        <Input
                          type="text"
                          id={`emergency_lighting.zones.${index}.name`}
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting.zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            handleInputChange('emergency_lighting.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter zone name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency_lighting.zones.${index}.duration`}>Duration (hours)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          id={`emergency_lighting.zones.${index}.duration`}
                          value={zone.duration}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting.zones];
                            newZones[index] = { ...zone, duration: parseFloat(e.target.value) };
                            handleInputChange('emergency_lighting.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter duration"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency_lighting.zones.${index}.lux_level`}>Lux Level (lx)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`emergency_lighting.zones.${index}.lux_level`}
                          value={zone.lux_level}
                          onChange={(e) => {
                            const newZones = [...formData.emergency_lighting.zones];
                            newZones[index] = { ...zone, lux_level: parseFloat(e.target.value) };
                            handleInputChange('emergency_lighting.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter lux level"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newZones = [...formData.emergency_lighting.zones, {
                    name: '',
                    duration: 0,
                    lux_level: 0
                  }];
                  handleInputChange('emergency_lighting.zones', newZones);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Emergency Lighting Zone</span>
              </button>
            </div>

            {/* Fire Hose Reels Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Hose Reels</h4>
              {formData.fire_hose_reels.map((reel, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`hose_reel_${index}`)}
                    >
                      <span className="font-medium">{reel.location || `Hose Reel ${index + 1}`}</span>
                      {expandedSections[`hose_reel_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newReels = formData.fire_hose_reels.filter((_, i) => i !== index);
                        handleInputChange('fire_hose_reels', newReels);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`hose_reel_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`fire_hose_reels.${index}.location`}>Location</Label>
                        <Input
                          type="text"
                          id={`fire_hose_reels.${index}.location`}
                          value={reel.location}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, location: e.target.value };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                          placeholder="Enter hose reel location"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fire_hose_reels.${index}.hose_length`}>Hose Length (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`fire_hose_reels.${index}.hose_length`}
                          value={reel.hose_length}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, hose_length: parseFloat(e.target.value) };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                          placeholder="Enter hose length"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fire_hose_reels.${index}.coverage_radius`}>Coverage Radius (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`fire_hose_reels.${index}.coverage_radius`}
                          value={reel.coverage_radius}
                          onChange={(e) => {
                            const newReels = [...formData.fire_hose_reels];
                            newReels[index] = { ...reel, coverage_radius: parseFloat(e.target.value) };
                            handleInputChange('fire_hose_reels', newReels);
                          }}
                          className={inputStyles}
                          placeholder="Enter coverage radius"
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
                <span>Add Fire Hose Reel</span>
              </button>
            </div>

            {/* Fire Extinguishers Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Extinguishers</h4>
              {formData.fire_extinguishers.map((extinguisher, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`extinguisher_${index}`)}
                    >
                      <span className="font-medium">{extinguisher.type || `Extinguisher ${index + 1}`}</span>
                      {expandedSections[`extinguisher_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newExtinguishers = formData.fire_extinguishers.filter((_, i) => i !== index);
                        handleInputChange('fire_extinguishers', newExtinguishers);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`extinguisher_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`fire_extinguishers.${index}.type`}>Extinguisher Type</Label>
                        <select
                          id={`fire_extinguishers.${index}.type`}
                          value={extinguisher.type}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, type: e.target.value };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select extinguisher type</option>
                          <option value="water">Water</option>
                          <option value="foam">Foam</option>
                          <option value="co2">CO2</option>
                          <option value="dry_chemical">Dry Chemical</option>
                          <option value="wet_chemical">Wet Chemical</option>
                          <option value="clean_agent">Clean Agent</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`fire_extinguishers.${index}.location`}>Location</Label>
                        <Input
                          type="text"
                          id={`fire_extinguishers.${index}.location`}
                          value={extinguisher.location}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, location: e.target.value };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                          placeholder="Enter extinguisher location"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fire_extinguishers.${index}.capacity`}>Capacity (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`fire_extinguishers.${index}.capacity`}
                          value={extinguisher.capacity}
                          onChange={(e) => {
                            const newExtinguishers = [...formData.fire_extinguishers];
                            newExtinguishers[index] = { ...extinguisher, capacity: parseFloat(e.target.value) };
                            handleInputChange('fire_extinguishers', newExtinguishers);
                          }}
                          className={inputStyles}
                          placeholder="Enter extinguisher capacity"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newExtinguishers = [...formData.fire_extinguishers, {
                    type: '',
                    location: '',
                    capacity: 0
                  }];
                  handleInputChange('fire_extinguishers', newExtinguishers);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Fire Extinguisher</span>
              </button>
            </div>

            {/* Fire Hydrants Section */}
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
                      onClick={() => {
                        const newHydrants = formData.fire_hydrants.filter((_, i) => i !== index);
                        handleInputChange('fire_hydrants', newHydrants);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`hydrant_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`fire_hydrants.${index}.location`}>Location</Label>
                        <Input
                          type="text"
                          id={`fire_hydrants.${index}.location`}
                          value={hydrant.location}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, location: e.target.value };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                          placeholder="Enter hydrant location"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`fire_hydrants.${index}.type`}>Hydrant Type</Label>
                        <select
                          id={`fire_hydrants.${index}.type`}
                          value={hydrant.type}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, type: e.target.value };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select hydrant type</option>
                          <option value="underground">Underground</option>
                          <option value="pillar">Pillar</option>
                          <option value="wall">Wall</option>
                          <option value="roof">Roof</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`fire_hydrants.${index}.flow_rate`}>Flow Rate (L/min)</Label>
                        <Input
                          type="number"
                          step="1"
                          id={`fire_hydrants.${index}.flow_rate`}
                          value={hydrant.flow_rate}
                          onChange={(e) => {
                            const newHydrants = [...formData.fire_hydrants];
                            newHydrants[index] = { ...hydrant, flow_rate: parseFloat(e.target.value) };
                            handleInputChange('fire_hydrants', newHydrants);
                          }}
                          className={inputStyles}
                          placeholder="Enter flow rate"
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
                    type: '',
                    flow_rate: 0
                  }];
                  handleInputChange('fire_hydrants', newHydrants);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Fire Hydrant</span>
              </button>
            </div>

            {/* Fire Water Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Water</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firewater.source">Water Source</Label>
                    <select
                      id="firewater.source"
                      value={formData.firewater.source}
                      onChange={(e) => handleInputChange('firewater.source', e.target.value)}
                      className={inputStyles}
                    >
                      <option value="">Select water source</option>
                      <option value="municipal">Municipal Supply</option>
                      <option value="storage_tank">Storage Tank</option>
                      <option value="dam">Dam</option>
                      <option value="river">River</option>
                      <option value="borehole">Borehole</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="firewater.capacity">Storage Capacity (kL)</Label>
                    <Input
                      type="number"
                      step="1"
                      id="firewater.capacity"
                      value={formData.firewater.capacity}
                      onChange={(e) => handleInputChange('firewater.capacity', parseFloat(e.target.value))}
                      className={inputStyles}
                      placeholder="Enter storage capacity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firewater.pressure">Pressure (kPa)</Label>
                    <Input
                      type="number"
                      step="1"
                      id="firewater.pressure"
                      value={formData.firewater.pressure}
                      onChange={(e) => handleInputChange('firewater.pressure', parseFloat(e.target.value))}
                      className={inputStyles}
                      placeholder="Enter pressure"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fire Detection and Alarm Systems Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Detection and Alarm Systems</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fire_detection.type">System Type</Label>
                    <select
                      id="fire_detection.type"
                      value={formData.fire_detection.type}
                      onChange={(e) => handleInputChange('fire_detection.type', e.target.value)}
                      className={inputStyles}
                    >
                      <option value="">Select system type</option>
                      <option value="conventional">Conventional</option>
                      <option value="addressable">Addressable</option>
                      <option value="wireless">Wireless</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="fire_detection.zones">Number of Zones</Label>
                    <Input
                      type="number"
                      step="1"
                      id="fire_detection.zones"
                      value={formData.fire_detection.zones}
                      onChange={(e) => handleInputChange('fire_detection.zones', parseInt(e.target.value))}
                      className={inputStyles}
                      placeholder="Enter number of zones"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fire_detection.battery_backup">Battery Backup Duration (hours)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      id="fire_detection.battery_backup"
                      value={formData.fire_detection.battery_backup}
                      onChange={(e) => handleInputChange('fire_detection.battery_backup', parseFloat(e.target.value))}
                      className={inputStyles}
                      placeholder="Enter battery backup duration"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fire Alarm Panel and Zones Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fire Alarm Panel and Zones</h4>
              <div className={cardStyles}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fire_alarm.panel_layout">Panel Layout</Label>
                    <div className="flex items-center space-x-4">
                      {formData.fire_alarm.panel_layout ? (
                        <div className="relative">
                          <img
                            src={formData.fire_alarm.panel_layout}
                            alt="Panel Layout"
                            className="w-32 h-32 object-cover rounded-2xl"
                          />
                          <button
                            onClick={() => handleInputChange('fire_alarm.panel_layout', '')}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            // Add file upload logic here
                            handleInputChange('fire_alarm.panel_layout', 'placeholder.jpg');
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

              {/* Fire Alarm Zones */}
              <div className="space-y-4">
                <h5 className="font-medium">Fire Alarm Zones</h5>
                {formData.fire_alarm.sprinkler_zones.map((zone, index) => (
                  <div key={index} className={cardStyles}>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        className="flex items-center justify-between flex-grow"
                        onClick={() => toggleSection(`fire_alarm_zone_${index}`)}
                      >
                        <span className="font-medium">{zone || `Zone ${index + 1}`}</span>
                        {expandedSections[`fire_alarm_zone_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          const newZones = formData.fire_alarm.sprinkler_zones.filter((_, i) => i !== index);
                          handleInputChange('fire_alarm.sprinkler_zones', newZones);
                        }}
                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {expandedSections[`fire_alarm_zone_${index}`] && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`fire_alarm.sprinkler_zones.${index}`}>Zone Name</Label>
                          <Input
                            type="text"
                            id={`fire_alarm.sprinkler_zones.${index}`}
                            value={zone}
                            onChange={(e) => {
                              const newZones = [...formData.fire_alarm.sprinkler_zones];
                              newZones[index] = e.target.value;
                              handleInputChange('fire_alarm.sprinkler_zones', newZones);
                            }}
                            className={inputStyles}
                            placeholder="Enter zone name"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newZones = [...formData.fire_alarm.sprinkler_zones, ''];
                    handleInputChange('fire_alarm.sprinkler_zones', newZones);
                  }}
                  className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Fire Alarm Zone</span>
                </button>
              </div>
            </div>

            {/* Smoke Ventilation Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Smoke Ventilation</h4>
              {formData.smoke_ventilation.zones.map((zone, index) => (
                <div key={index} className={cardStyles}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="flex items-center justify-between flex-grow"
                      onClick={() => toggleSection(`smoke_ventilation_${index}`)}
                    >
                      <span className="font-medium">{zone.name || `Zone ${index + 1}`}</span>
                      {expandedSections[`smoke_ventilation_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const newZones = formData.smoke_ventilation.zones.filter((_, i) => i !== index);
                        handleInputChange('smoke_ventilation.zones', newZones);
                      }}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {expandedSections[`smoke_ventilation_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`smoke_ventilation.zones.${index}.name`}>Zone Name</Label>
                        <Input
                          type="text"
                          id={`smoke_ventilation.zones.${index}.name`}
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation.zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            handleInputChange('smoke_ventilation.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter zone name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`smoke_ventilation.zones.${index}.area`}>Ventilation Area (m²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`smoke_ventilation.zones.${index}.area`}
                          value={zone.area}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation.zones];
                            newZones[index] = { ...zone, area: parseFloat(e.target.value) };
                            handleInputChange('smoke_ventilation.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter ventilation area"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`smoke_ventilation.zones.${index}.ventilation_rate`}>Ventilation Rate (m³/s)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          id={`smoke_ventilation.zones.${index}.ventilation_rate`}
                          value={zone.ventilation_rate}
                          onChange={(e) => {
                            const newZones = [...formData.smoke_ventilation.zones];
                            newZones[index] = { ...zone, ventilation_rate: parseFloat(e.target.value) };
                            handleInputChange('smoke_ventilation.zones', newZones);
                          }}
                          className={inputStyles}
                          placeholder="Enter ventilation rate"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newZones = [...formData.smoke_ventilation.zones, {
                    name: '',
                    area: 0,
                    ventilation_rate: 0
                  }];
                  handleInputChange('smoke_ventilation.zones', newZones);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Smoke Ventilation Zone</span>
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            {/* Special Risks Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Special Risks</h4>
              {formData.special_risks.map((risk, index) => (
                <div key={index} className={cardStyles}>
                  <button
                    className="w-full flex items-center justify-between mb-4"
                    onClick={() => toggleSection(`special_risk_${index}`)}
                  >
                    <span className="font-medium">{risk.type || `Special Risk ${index + 1}`}</span>
                    {expandedSections[`special_risk_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {expandedSections[`special_risk_${index}`] && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`special_risks.${index}.type`}>Risk Type</Label>
                        <select
                          id={`special_risks.${index}.type`}
                          value={risk.type}
                          onChange={(e) => {
                            const newRisks = [...formData.special_risks];
                            newRisks[index] = { ...risk, type: e.target.value };
                            handleInputChange('special_risks', newRisks);
                          }}
                          className={inputStyles}
                        >
                          <option value="">Select risk type</option>
                          <option value="diesel_tank">Diesel Tank</option>
                          <option value="transformer">Transformer</option>
                          <option value="decommissioned_tanks">Decommissioned Tanks</option>
                          <option value="inverter_battery_room">Inverter & Battery Room</option>
                          <option value="pallet_storage">Idle Pallet Storage</option>
                          <option value="forklift_charging">Forklift Charging Station</option>
                          <option value="substation">Substation</option>
                          <option value="oil_tank">Oil Tank</option>
                          <option value="generator">Generator</option>
                          <option value="mezzanine">Mezzanine</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`special_risks.${index}.location`}>Location</Label>
                        <Input
                          type="text"
                          id={`special_risks.${index}.location`}
                          value={risk.location}
                          onChange={(e) => {
                            const newRisks = [...formData.special_risks];
                            newRisks[index] = { ...risk, location: e.target.value };
                            handleInputChange('special_risks', newRisks);
                          }}
                          className={inputStyles}
                          placeholder="Enter location"
                        />
                    </div>
                      <div>
                        <Label htmlFor={`special_risks.${index}.details`}>Details</Label>
                        <Textarea
                          id={`special_risks.${index}.details`}
                          value={risk.details}
                          onChange={(e) => {
                            const newRisks = [...formData.special_risks];
                            newRisks[index] = { ...risk, details: e.target.value };
                            handleInputChange('special_risks', newRisks);
                          }}
                          className={inputStyles}
                          placeholder="Enter additional details"
                        />
                  </div>
                      <div>
                        <Label htmlFor={`special_risks.${index}.photo`}>Photo</Label>
                        <div className="flex items-center space-x-4">
                          {risk.photo ? (
                            <div className="relative">
                              <img
                                src={risk.photo}
                                alt={`${risk.type} Photo`}
                                className="w-32 h-32 object-cover rounded-2xl"
                              />
                              <button
                                onClick={() => {
                                  const newRisks = [...formData.special_risks];
                                  newRisks[index] = { ...risk, photo: '' };
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
                                newRisks[index] = { ...risk, photo: 'placeholder.jpg' };
                                handleInputChange('special_risks', newRisks);
                              }}
                              className="w-32 h-32 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Upload className="w-8 h-8" />
                            </button>
                          )}
                    </div>
                  </div>
                      <button
                        onClick={() => {
                          const newRisks = formData.special_risks.filter((_, i) => i !== index);
                          handleInputChange('special_risks', newRisks);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                </div>
                  )}
              </div>
              ))}
              <button
                onClick={() => {
                  const newRisks = [...formData.special_risks, {
                    type: '',
                    location: '',
                    details: '',
                    photo: ''
                  }];
                  handleInputChange('special_risks', newRisks);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Special Risk</span>
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
                          <p className="font-medium">{building.total_floor_area ? `${building.total_floor_area} m²` : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Construction Materials</p>
                          <p className="font-medium">
                            {Object.entries(building.construction_materials)
                              .filter(([_, value]) => value)
                              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                              .join(', ') || 'Not specified'}
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
                      <p className="text-sm text-muted-foreground">Photos: {zone.photos.length}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Commodity Classification */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 4: Commodity Classification</h5>
                <div className="space-y-4">
                  {formData.buildings[0]?.fire_load.commodities.map((commodity, index) => (
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
                          <p className="font-medium">{commodity.minimum_stacking_height ? `${commodity.minimum_stacking_height} m` : 'Not specified'}</p>
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

              {/* Step 5: Fire Protection Systems */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 5: Fire Protection Systems</h5>
                <div className="space-y-4">
                  {/* Fire Alarm System */}
                  <div>
                    <p className="text-sm text-muted-foreground">Fire Alarm System</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">System Type</p>
                        <p className="font-medium">{formData.fire_detection.type || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Number of Zones</p>
                        <p className="font-medium">{formData.fire_detection.zones || 'Not specified'}</p>
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
                    <p className="font-medium">{formData.smoke_ventilation.zones.length} zones</p>
                  </div>
                </div>
              </div>

              {/* Step 6: Special Risks */}
              <div className={cardStyles}>
                <h5 className="font-medium mb-4">Step 6: Special Risks</h5>
                <div className="space-y-4">
                  {formData.special_risks.map((risk, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Type</p>
                          <p className="font-medium">{risk.type || 'Not specified'}</p>
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
            </div>

            {/* Mandatory Actions Section */}
            <div className="space-y-2">
              <Label htmlFor="mandatory_actions">Mandatory Actions</Label>
              {formData.mandatory_actions.map((action, index) => (
                <div key={index} className={cardStyles}>
                  <button
                    className="w-full flex items-center justify-between mb-4"
                    onClick={() => toggleSection(`mandatory_${index}`)}
                  >
                    <span className="font-medium">{action || `Mandatory Action ${index + 1}`}</span>
                    {expandedSections[`mandatory_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {expandedSections[`mandatory_${index}`] && (
                    <div className="space-y-4">
                      <Input
                        type="text"
                        id={`mandatory_actions.${index}`}
                        value={action}
                        onChange={(e) => {
                          const newActions = [...formData.mandatory_actions];
                          newActions[index] = e.target.value;
                          handleInputChange('mandatory_actions', newActions);
                        }}
                        className={inputStyles}
                        placeholder="Enter mandatory action"
                      />
                      <button
                        onClick={() => {
                          const newActions = formData.mandatory_actions.filter((_, i) => i !== index);
                          handleInputChange('mandatory_actions', newActions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newActions = [...formData.mandatory_actions, ''];
                  handleInputChange('mandatory_actions', newActions);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Mandatory Action</span>
              </button>
            </div>
                <div className="space-y-2">
              <Label htmlFor="optional_actions">Optional Actions</Label>
              {formData.optional_actions.map((action, index) => (
                <div key={index} className={cardStyles}>
                  <button
                    className="w-full flex items-center justify-between mb-4"
                    onClick={() => toggleSection(`optional_${index}`)}
                  >
                    <span className="font-medium">{action || `Optional Action ${index + 1}`}</span>
                    {expandedSections[`optional_${index}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {expandedSections[`optional_${index}`] && (
                    <div className="space-y-4">
                      <Input
                        type="text"
                        id={`optional_actions.${index}`}
                        value={action}
                        onChange={(e) => {
                          const newActions = [...formData.optional_actions];
                          newActions[index] = e.target.value;
                          handleInputChange('optional_actions', newActions);
                        }}
                        className={inputStyles}
                        placeholder="Enter optional action"
                      />
                      <button
                        onClick={() => {
                          const newActions = formData.optional_actions.filter((_, i) => i !== index);
                          handleInputChange('optional_actions', newActions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                  </div>
                  )}
                  </div>
              ))}
              <button
                onClick={() => {
                  const newActions = [...formData.optional_actions, ''];
                  handleInputChange('optional_actions', newActions);
                }}
                className={`${buttonStyles} btn-secondary flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Optional Action</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-sm text-muted-foreground">
            Complete the form below to create a new project
                    </p>
                  </div>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={loading}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Save Draft
        </Button>
                </div>
      
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Steps */}
          <div className="relative mb-12">
            {/* Progress Bar */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary transform -translate-y-1/2">
              <div 
                className="h-full bg-fire transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>

            {/* Step Buttons */}
            <div className="relative flex justify-between">
              {Array.from({ length: totalSteps }, (_, i) => (
                <button
                  key={i}
                  className="group flex flex-col items-center"
                  onClick={() => handleStepClick(i + 1)}
                >
                  {/* Step Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep >= i + 1 
                        ? 'bg-fire text-white shadow-lg shadow-fire/30' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }
                      ${currentStep === i + 1 && 'ring-4 ring-fire/20'}
                    `}
                  >
                    {currentStep > i + 1 ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-medium">{i + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Label - Only show for current step */}
                  {currentStep === i + 1 && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-2 rounded-lg text-sm font-medium bg-fire/10 text-fire shadow-lg whitespace-nowrap">
                        {[
                          "Project Setup",
                          "Occupancy Classification",
                          "Facility Overview",
                          "Commodity Classification",
                          "Fire Protection Systems",
                          "Special Risks & Mitigation",
                          "Final Summary"
                        ][i]}
              </div>
            </div>
          )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {currentStep === totalSteps ? (
              <Button type="submit" className="gap-2">
                Create Project
              </Button>
            ) : (
              <Button
                type="button"
              onClick={nextStep}
                className="gap-2"
            >
              Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProjectWizard;
