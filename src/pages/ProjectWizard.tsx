import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building, Users, MapPin, FileText, Clipboard, Check, Upload, X, Plus, Camera, ChevronDown, ChevronUp, BookOpen, Menu, Home, Settings, HelpCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectData {
  // Step 1: Project Setup
  client_name: string;
  facility_address: string;
  occupancy_certificate_status: string;
  aerial_view_image: string;
  cad_site_plan: string;
  pre_1985_building: boolean;
  name: string;
  
  // Step 2: Occupancy Classification
  buildings: Array<{
    name: string;
    classification: string;
    construction_materials: {
      brick: boolean;
      steel: boolean;
      concrete: boolean;
      timber: boolean;
      other: string;
    };
    total_floor_area: number;
    sans_10400_t_table: string;
    fire_load: {
      commodities: Array<{
        name: string;
        quantity: number;
        calorific_value: number;
        timber_equivalent: number;
      }>;
    };
  }>;
  
  // Step 3: Facility Overview
  zones: Array<{
    name: string;
    photos: string[];
  }>;
  special_risks: {
    diesel_tank: {
      location: string;
      photo: string;
    };
    inverter_canopy: {
      details: string;
      photo: string;
    };
    pallet_storage: {
      location: string;
      photo: string;
    };
  };
  
  // Step 4: Commodity Classification
  storage_details: Array<{
    commodity_type: string;
    category: 'I' | 'II' | 'III' | 'IV';
    stack_height: number;
  }>;
  
  // Step 5: Fire Protection Systems
  divisional_separation: {
    fire_rated_walls: boolean;
    fire_rated_doors: boolean;
    penetrations: boolean;
    separation_plan: string;
  };
  fire_alarm: {
    panel_layout: string;
    sprinkler_zones: string[];
    hydrant_locations: string[];
  };
  
  // Step 6: Escape Routes & Signage
  escape_routes: {
    travel_distances: string;
    emergency_lighting_zones: string[];
    door_rotation_diagrams: string[];
  };
  signage: {
    photoluminescent_signs: boolean;
  };
  
  // Step 7: Special Risks & Mitigation
  pallet_storage: {
    fmds_8_24_diagram: string;
    indoor_photo: string;
  };
  oil_tanks: {
    indoor_photo: string;
    outdoor_photo: string;
    bunding_compliant: boolean;
  };
  
  // Step 8: Final Summary & Recommendations
  mandatory_actions: string[];
  optional_actions: string[];
  engineer_signoff: {
    name: string;
    ecsa_number: string;
    signature: string;
  };
}

const ProjectWizard = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);
  const [selectedSansDoc, setSelectedSansDoc] = useState<string>("10400-T");
  const [showSansSelector, setShowSansSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [projectData, setProjectData] = useState<ProjectData>({
    // Step 1: Project Setup
    client_name: "",
    facility_address: "",
    occupancy_certificate_status: "",
    aerial_view_image: "",
    cad_site_plan: "",
    pre_1985_building: false,
    name: "",
    
    // Step 2: Occupancy Classification
    buildings: [],
    
    // Step 3: Facility Overview
    zones: [],
    special_risks: {
      diesel_tank: {
        location: "",
        photo: "",
      },
      inverter_canopy: {
        details: "",
        photo: "",
      },
      pallet_storage: {
        location: "",
        photo: "",
      },
    },
    
    // Step 4: Commodity Classification
    storage_details: [],
    
    // Step 5: Fire Protection Systems
    divisional_separation: {
      fire_rated_walls: false,
      fire_rated_doors: false,
      penetrations: false,
      separation_plan: "",
    },
    fire_alarm: {
      panel_layout: "",
      sprinkler_zones: [],
      hydrant_locations: [],
    },
    
    // Step 6: Escape Routes & Signage
    escape_routes: {
      travel_distances: "",
      emergency_lighting_zones: [],
      door_rotation_diagrams: [],
    },
    signage: {
      photoluminescent_signs: false,
    },
    
    // Step 7: Special Risks & Mitigation
    pallet_storage: {
      fmds_8_24_diagram: "",
      indoor_photo: "",
    },
    oil_tanks: {
      indoor_photo: "",
      outdoor_photo: "",
      bunding_compliant: false,
    },
    
    // Step 8: Final Summary & Recommendations
    mandatory_actions: [],
    optional_actions: [],
    engineer_signoff: {
      name: "",
      ecsa_number: "",
      signature: "",
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    setProjectData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => i === index ? value : item)
    }));
  };

  const handleArrayAdd = (field: string, value: any) => {
    setProjectData(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const handleArrayRemove = (field: string, index: number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleStepClick = (stepNumber: number) => {
    setStep(stepNumber);
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
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

  // Common styles for form elements
  const inputStyles = "w-full px-4 py-2.5 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-fire/20 transition-all duration-200";
  const buttonStyles = "px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200";
  const cardStyles = "border border-border rounded-2xl p-6 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200";
  const checkboxWrapperStyles = "flex items-center space-x-3 cursor-pointer group";
  const checkboxStyles = "w-5 h-5 border-2 border-border rounded-xl checked:bg-fire checked:border-fire transition-all duration-200";

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Floating Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-background/80 backdrop-blur-sm border-r border-border shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-2xl bg-fire flex items-center justify-center shadow-lg">
                  <span className="font-bold text-white">FF</span>
                </div>
                <span className="font-bold text-lg ml-3">FireFly</span>
              </div>
            )}
            <button 
              className="p-2.5 hover:bg-secondary/80 rounded-2xl transition-all duration-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-8">
            {/* Main Navigation */}
            <div>
              <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200">
                <Home className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
            </div>

            {/* SANS Document Selection */}
            <div>
              <div className={`text-sm font-medium mb-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                SANS Documents
              </div>
              <div className="space-y-2">
                {["10400-T", "10400-A", "10131"].map((doc) => (
                  <button
                    key={doc}
                    className={`w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200 ${
                      selectedSansDoc === doc ? 'bg-fire/10 text-fire shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedSansDoc(doc)}
                  >
                    <BookOpen className="w-5 h-5" />
                    {sidebarOpen && <span>SANS {doc}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Steps */}
            <div>
              <div className={`text-sm font-medium mb-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                Project Steps
              </div>
              <div className="space-y-2">
                {[
                  "Project Setup",
                  "Occupancy Classification",
                  "Facility Overview",
                  "Commodity Classification",
                  "Fire Protection Systems",
                  "Escape Routes & Signage",
                  "Special Risks & Mitigation",
                  "Final Summary"
                ].map((stepName, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200 ${
                      step === index + 1 ? 'bg-fire/10 text-fire shadow-lg' : ''
                    }`}
                    onClick={() => setStep(index + 1)}
                  >
                    <div className={`w-6 h-6 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                      step >= index + 1 ? 'bg-fire text-white' : 'bg-secondary group-hover:bg-secondary/80'
                    }`}>
                      {index + 1}
                    </div>
                    {sidebarOpen && <span className="truncate">{stepName}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="pt-6 space-y-2">
            <button className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-secondary/80 transition-all duration-200">
              <HelpCircle className="w-5 h-5" />
              {sidebarOpen && <span>Help</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 shadow-lg">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <button 
              className="btn-primary flex items-center space-x-2 px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/dashboard')}
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
            <button 
              className="btn-secondary flex items-center space-x-2 px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleSaveDraft}
            >
              <FileText className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
          </div>
        </header>

        {/* Wizard Content */}
        <div className="container mx-auto px-6 py-10">
          <div className="glass-card p-10 rounded-3xl max-w-4xl mx-auto shadow-2xl bg-white/50 backdrop-blur-sm">
            {/* Step Indicators */}
            <div className="relative mb-12">
              {/* Progress Bar */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary transform -translate-y-1/2">
                <div 
                  className="h-full bg-fire transition-all duration-300 rounded-full"
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2
                        ${step >= i + 1 
                          ? 'bg-fire text-white shadow-lg shadow-fire/30' 
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }
                        ${step === i + 1 && 'ring-4 ring-fire/20'}
                      `}
                    >
                      {step > i + 1 ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <span className="text-lg font-medium">{i + 1}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <span 
                      className={`absolute top-16 text-sm font-medium transition-all duration-300 whitespace-nowrap transform -translate-x-1/2 opacity-0 group-hover:opacity-100
                        ${step === i + 1 ? 'text-fire opacity-100' : 'text-muted-foreground'}
                      `}
                    >
                      {[
                        "Project Setup",
                        "Occupancy Classification",
                        "Facility Overview",
                        "Commodity Classification",
                        "Fire Protection Systems",
                        "Escape Routes & Signage",
                        "Special Risks & Mitigation",
                        "Final Summary"
                      ][i]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-8">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Project Setup</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Name</label>
                      <input
                        type="text"
                        name="name"
                        value={projectData.name}
                        onChange={handleInputChange}
                        className={inputStyles}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Client Name</label>
                      <input
                        type="text"
                        name="client_name"
                        value={projectData.client_name}
                        onChange={handleInputChange}
                        className={inputStyles}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Facility Address</label>
                      <textarea
                        name="facility_address"
                        value={projectData.facility_address}
                        onChange={handleInputChange}
                        className={inputStyles}
                        placeholder="Enter facility address"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Occupancy Certificate Status</label>
                      <select
                        name="occupancy_certificate_status"
                        value={projectData.occupancy_certificate_status}
                        onChange={handleInputChange}
                        className={inputStyles}
                      >
                        <option value="">Select status</option>
                        <option value="valid">Valid</option>
                        <option value="expired">Expired</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className={checkboxWrapperStyles}>
                        <input
                          type="checkbox"
                          name="pre_1985_building"
                          checked={projectData.pre_1985_building}
                          onChange={handleInputChange}
                          className={checkboxStyles}
                        />
                        <span className="text-sm font-medium group-hover:text-fire transition-colors duration-200">
                          This building was constructed before 1985
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Occupancy Classification</h2>
                  <div className="space-y-6">
                    {projectData.buildings.map((building, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <button
                          className="w-full flex items-center justify-between mb-4"
                          onClick={() => toggleBuilding(index)}
                        >
                          <span className="font-medium">{building.name || `Building ${index + 1}`}</span>
                          {expandedBuildings.includes(index) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        {expandedBuildings.includes(index) && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Building Name</label>
                              <input
                                type="text"
                                value={building.name}
                                onChange={(e) => handleArrayChange('buildings', index, { ...building, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter building name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Classification</label>
                              <select
                                value={building.classification}
                                onChange={(e) => handleArrayChange('buildings', index, { ...building, classification: e.target.value })}
                                className="w-full p-2 border rounded"
                              >
                                <option value="">Select classification</option>
                                {["A1", "A2", "A3", "A4", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "D3", "D4", "E1", "E2", "E3", "E4", "F1", "F2", "F3", "G1", "H1", "H2", "H3", "H4", "J1", "J2", "J3", "J4"].map(cls => (
                                  <option key={cls} value={cls}>{cls}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Construction Materials</label>
                              <div className="space-y-2">
                                {Object.entries({
                                  brick: "Brick",
                                  steel: "Steel",
                                  concrete: "Concrete",
                                  timber: "Timber"
                                }).map(([key, label]) => (
                                  <label key={key} className="flex items-center">
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
                                      className="mr-2"
                                    />
                                    {label}
                                  </label>
                                ))}
                                <input
                                  type="text"
                                  value={building.construction_materials.other}
                                  onChange={(e) => handleArrayChange('buildings', index, {
                                    ...building,
                                    construction_materials: {
                                      ...building.construction_materials,
                                      other: e.target.value
                                    }
                                  })}
                                  className="w-full p-2 border rounded mt-2"
                                  placeholder="Other materials"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Total Floor Area (m²)</label>
                              <input
                                type="number"
                                value={building.total_floor_area}
                                onChange={(e) => handleArrayChange('buildings', index, { ...building, total_floor_area: parseFloat(e.target.value) })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter total floor area"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Fire Load Calculation</label>
                              <div className="space-y-4">
                                {building.fire_load.commodities.map((commodity, commodityIndex) => (
                                  <div key={commodityIndex} className="flex items-center space-x-4">
                                    <input
                                      type="text"
                                      value={commodity.name}
                                      onChange={(e) => {
                                        const newCommodities = [...building.fire_load.commodities];
                                        newCommodities[commodityIndex] = { ...commodity, name: e.target.value };
                                        handleArrayChange('buildings', index, {
                                          ...building,
                                          fire_load: { ...building.fire_load, commodities: newCommodities }
                                        });
                                      }}
                                      className="flex-1 p-2 border rounded"
                                      placeholder="Commodity name"
                                    />
                                    <input
                                      type="number"
                                      value={commodity.quantity}
                                      onChange={(e) => {
                                        const newCommodities = [...building.fire_load.commodities];
                                        newCommodities[commodityIndex] = { ...commodity, quantity: parseFloat(e.target.value) };
                                        handleArrayChange('buildings', index, {
                                          ...building,
                                          fire_load: { ...building.fire_load, commodities: newCommodities }
                                        });
                                      }}
                                      className="w-32 p-2 border rounded"
                                      placeholder="Quantity"
                                    />
                                    <input
                                      type="number"
                                      value={commodity.calorific_value}
                                      onChange={(e) => {
                                        const newCommodities = [...building.fire_load.commodities];
                                        newCommodities[commodityIndex] = { ...commodity, calorific_value: parseFloat(e.target.value) };
                                        handleArrayChange('buildings', index, {
                                          ...building,
                                          fire_load: { ...building.fire_load, commodities: newCommodities }
                                        });
                                      }}
                                      className="w-32 p-2 border rounded"
                                      placeholder="Calorific value"
                                    />
                                    <button
                                      onClick={() => {
                                        const newCommodities = building.fire_load.commodities.filter((_, i) => i !== commodityIndex);
                                        handleArrayChange('buildings', index, {
                                          ...building,
                                          fire_load: { ...building.fire_load, commodities: newCommodities }
                                        });
                                      }}
                                      className="p-2 text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newCommodities = [...building.fire_load.commodities, { name: '', quantity: 0, calorific_value: 0, timber_equivalent: 0 }];
                                    handleArrayChange('buildings', index, {
                                      ...building,
                                      fire_load: { ...building.fire_load, commodities: newCommodities }
                                    });
                                  }}
                                  className="btn-secondary flex items-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add Commodity</span>
                                </button>
                              </div>
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
                        sans_10400_t_table: '',
                        fire_load: {
                          commodities: []
                        }
                      })}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Building</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Facility Overview</h2>
                  <div className="space-y-6">
                    {/* Zones */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Zones</h3>
                      {projectData.zones.map((zone, index) => (
                        <div key={index} className="border rounded-lg p-4 mb-4">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Zone Name</label>
                              <input
                                type="text"
                                value={zone.name}
                                onChange={(e) => handleArrayChange('zones', index, { ...zone, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter zone name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Photos</label>
                              <div className="flex flex-wrap gap-4">
                                {zone.photos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="relative">
                                    <img src={photo} alt={`Zone ${index + 1} Photo ${photoIndex + 1}`} className="w-32 h-32 object-cover rounded" />
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
                                    // Add photo upload logic here
                                    const newPhotos = [...zone.photos, 'placeholder.jpg'];
                                    handleArrayChange('zones', index, { ...zone, photos: newPhotos });
                                  }}
                                  className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                  <Camera className="w-8 h-8" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => handleArrayAdd('zones', { name: '', photos: [] })}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Zone</span>
                      </button>
                    </div>

                    {/* Special Risks */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Special Risks</h3>
                      <div className="space-y-6">
                        {/* Diesel Tank */}
                        <div className="border rounded-lg p-4">
                          <h4 className="text-lg font-medium mb-4">Diesel Tank</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Location</label>
                              <input
                                type="text"
                                value={projectData.special_risks.diesel_tank.location}
                                onChange={(e) => setProjectData(prev => ({
                                  ...prev,
                                  special_risks: {
                                    ...prev.special_risks,
                                    diesel_tank: {
                                      ...prev.special_risks.diesel_tank,
                                      location: e.target.value
                                    }
                                  }
                                }))}
                                className="w-full p-2 border rounded"
                                placeholder="Enter diesel tank location"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Photo</label>
                              <div className="flex items-center space-x-4">
                                {projectData.special_risks.diesel_tank.photo && (
                                  <div className="relative">
                                    <img
                                      src={projectData.special_risks.diesel_tank.photo}
                                      alt="Diesel Tank"
                                      className="w-32 h-32 object-cover rounded"
                                    />
                                    <button
                                      onClick={() => setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          diesel_tank: {
                                            ...prev.special_risks.diesel_tank,
                                            photo: ''
                                          }
                                        }
                                      }))}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {!projectData.special_risks.diesel_tank.photo && (
                                  <button
                                    onClick={() => {
                                      // Add photo upload logic here
                                      setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          diesel_tank: {
                                            ...prev.special_risks.diesel_tank,
                                            photo: 'placeholder.jpg'
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                                  >
                                    <Camera className="w-8 h-8" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inverter Canopy */}
                        <div className="border rounded-lg p-4">
                          <h4 className="text-lg font-medium mb-4">Inverter Canopy</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Details</label>
                              <textarea
                                value={projectData.special_risks.inverter_canopy.details}
                                onChange={(e) => setProjectData(prev => ({
                                  ...prev,
                                  special_risks: {
                                    ...prev.special_risks,
                                    inverter_canopy: {
                                      ...prev.special_risks.inverter_canopy,
                                      details: e.target.value
                                    }
                                  }
                                }))}
                                className="w-full p-2 border rounded"
                                placeholder="Enter inverter canopy details"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Photo</label>
                              <div className="flex items-center space-x-4">
                                {projectData.special_risks.inverter_canopy.photo && (
                                  <div className="relative">
                                    <img
                                      src={projectData.special_risks.inverter_canopy.photo}
                                      alt="Inverter Canopy"
                                      className="w-32 h-32 object-cover rounded"
                                    />
                                    <button
                                      onClick={() => setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          inverter_canopy: {
                                            ...prev.special_risks.inverter_canopy,
                                            photo: ''
                                          }
                                        }
                                      }))}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {!projectData.special_risks.inverter_canopy.photo && (
                                  <button
                                    onClick={() => {
                                      // Add photo upload logic here
                                      setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          inverter_canopy: {
                                            ...prev.special_risks.inverter_canopy,
                                            photo: 'placeholder.jpg'
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                                  >
                                    <Camera className="w-8 h-8" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pallet Storage */}
                        <div className="border rounded-lg p-4">
                          <h4 className="text-lg font-medium mb-4">Pallet Storage</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Location</label>
                              <input
                                type="text"
                                value={projectData.special_risks.pallet_storage.location}
                                onChange={(e) => setProjectData(prev => ({
                                  ...prev,
                                  special_risks: {
                                    ...prev.special_risks,
                                    pallet_storage: {
                                      ...prev.special_risks.pallet_storage,
                                      location: e.target.value
                                    }
                                  }
                                }))}
                                className="w-full p-2 border rounded"
                                placeholder="Enter pallet storage location"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Photo</label>
                              <div className="flex items-center space-x-4">
                                {projectData.special_risks.pallet_storage.photo && (
                                  <div className="relative">
                                    <img
                                      src={projectData.special_risks.pallet_storage.photo}
                                      alt="Pallet Storage"
                                      className="w-32 h-32 object-cover rounded"
                                    />
                                    <button
                                      onClick={() => setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          pallet_storage: {
                                            ...prev.special_risks.pallet_storage,
                                            photo: ''
                                          }
                                        }
                                      }))}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {!projectData.special_risks.pallet_storage.photo && (
                                  <button
                                    onClick={() => {
                                      // Add photo upload logic here
                                      setProjectData(prev => ({
                                        ...prev,
                                        special_risks: {
                                          ...prev.special_risks,
                                          pallet_storage: {
                                            ...prev.special_risks.pallet_storage,
                                            photo: 'placeholder.jpg'
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                                  >
                                    <Camera className="w-8 h-8" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Commodity Classification</h2>
                  <div className="space-y-6">
                    {projectData.storage_details.map((storage, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Commodity Type</label>
                            <input
                              type="text"
                              value={storage.commodity_type}
                              onChange={(e) => handleArrayChange('storage_details', index, { ...storage, commodity_type: e.target.value })}
                              className="w-full p-2 border rounded"
                              placeholder="Enter commodity type"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                              value={storage.category}
                              onChange={(e) => handleArrayChange('storage_details', index, { ...storage, category: e.target.value as 'I' | 'II' | 'III' | 'IV' })}
                              className="w-full p-2 border rounded"
                            >
                              <option value="">Select category</option>
                              <option value="I">Category I</option>
                              <option value="II">Category II</option>
                              <option value="III">Category III</option>
                              <option value="IV">Category IV</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Stack Height (m)</label>
                            <input
                              type="number"
                              value={storage.stack_height}
                              onChange={(e) => handleArrayChange('storage_details', index, { ...storage, stack_height: parseFloat(e.target.value) })}
                              className="w-full p-2 border rounded"
                              placeholder="Enter stack height"
                            />
                          </div>
                          <button
                            onClick={() => handleArrayRemove('storage_details', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleArrayAdd('storage_details', {
                        commodity_type: '',
                        category: '',
                        stack_height: 0
                      })}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Storage Detail</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Fire Protection Systems</h2>
                  <div className="space-y-6">
                    {/* Divisional Separation */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Divisional Separation</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={projectData.divisional_separation.fire_rated_walls}
                              onChange={(e) => setProjectData(prev => ({
                                ...prev,
                                divisional_separation: {
                                  ...prev.divisional_separation,
                                  fire_rated_walls: e.target.checked
                                }
                              }))}
                              className="mr-2"
                            />
                            Fire Rated Walls
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={projectData.divisional_separation.fire_rated_doors}
                              onChange={(e) => setProjectData(prev => ({
                                ...prev,
                                divisional_separation: {
                                  ...prev.divisional_separation,
                                  fire_rated_doors: e.target.checked
                                }
                              }))}
                              className="mr-2"
                            />
                            Fire Rated Doors
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={projectData.divisional_separation.penetrations}
                              onChange={(e) => setProjectData(prev => ({
                                ...prev,
                                divisional_separation: {
                                  ...prev.divisional_separation,
                                  penetrations: e.target.checked
                                }
                              }))}
                              className="mr-2"
                            />
                            Penetrations
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Separation Plan</label>
                          <div className="flex items-center space-x-4">
                            {projectData.divisional_separation.separation_plan && (
                              <div className="relative">
                                <img
                                  src={projectData.divisional_separation.separation_plan}
                                  alt="Separation Plan"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    divisional_separation: {
                                      ...prev.divisional_separation,
                                      separation_plan: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.divisional_separation.separation_plan && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    divisional_separation: {
                                      ...prev.divisional_separation,
                                      separation_plan: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Upload className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fire Alarm */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Fire Alarm System</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Panel Layout</label>
                          <div className="flex items-center space-x-4">
                            {projectData.fire_alarm.panel_layout && (
                              <div className="relative">
                                <img
                                  src={projectData.fire_alarm.panel_layout}
                                  alt="Panel Layout"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    fire_alarm: {
                                      ...prev.fire_alarm,
                                      panel_layout: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.fire_alarm.panel_layout && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    fire_alarm: {
                                      ...prev.fire_alarm,
                                      panel_layout: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Upload className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sprinkler Zones */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Sprinkler Zones</label>
                          <div className="space-y-2">
                            {projectData.fire_alarm.sprinkler_zones.map((zone, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={zone}
                                  onChange={(e) => {
                                    const newZones = [...projectData.fire_alarm.sprinkler_zones];
                                    newZones[index] = e.target.value;
                                    setProjectData(prev => ({
                                      ...prev,
                                      fire_alarm: {
                                        ...prev.fire_alarm,
                                        sprinkler_zones: newZones
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-2 border rounded"
                                  placeholder="Enter zone name"
                                />
                                <button
                                  onClick={() => {
                                    const newZones = projectData.fire_alarm.sprinkler_zones.filter((_, i) => i !== index);
                                    setProjectData(prev => ({
                                      ...prev,
                                      fire_alarm: {
                                        ...prev.fire_alarm,
                                        sprinkler_zones: newZones
                                      }
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newZones = [...projectData.fire_alarm.sprinkler_zones, ''];
                                setProjectData(prev => ({
                                  ...prev,
                                  fire_alarm: {
                                    ...prev.fire_alarm,
                                    sprinkler_zones: newZones
                                  }
                                }));
                              }}
                              className="btn-secondary flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Zone</span>
                            </button>
                          </div>
                        </div>

                        {/* Hydrant Locations */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Hydrant Locations</label>
                          <div className="space-y-2">
                            {projectData.fire_alarm.hydrant_locations.map((location, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={location}
                                  onChange={(e) => {
                                    const newLocations = [...projectData.fire_alarm.hydrant_locations];
                                    newLocations[index] = e.target.value;
                                    setProjectData(prev => ({
                                      ...prev,
                                      fire_alarm: {
                                        ...prev.fire_alarm,
                                        hydrant_locations: newLocations
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-2 border rounded"
                                  placeholder="Enter hydrant location"
                                />
                                <button
                                  onClick={() => {
                                    const newLocations = projectData.fire_alarm.hydrant_locations.filter((_, i) => i !== index);
                                    setProjectData(prev => ({
                                      ...prev,
                                      fire_alarm: {
                                        ...prev.fire_alarm,
                                        hydrant_locations: newLocations
                                      }
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newLocations = [...projectData.fire_alarm.hydrant_locations, ''];
                                setProjectData(prev => ({
                                  ...prev,
                                  fire_alarm: {
                                    ...prev.fire_alarm,
                                    hydrant_locations: newLocations
                                  }
                                }));
                              }}
                              className="btn-secondary flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Location</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Escape Routes & Signage</h2>
                  <div className="space-y-6">
                    {/* Escape Routes */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Escape Routes</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Travel Distances</label>
                          <textarea
                            value={projectData.escape_routes.travel_distances}
                            onChange={(e) => setProjectData(prev => ({
                              ...prev,
                              escape_routes: {
                                ...prev.escape_routes,
                                travel_distances: e.target.value
                              }
                            }))}
                            className="w-full p-2 border rounded"
                            placeholder="Enter travel distances"
                            rows={3}
                          />
                        </div>

                        {/* Emergency Lighting Zones */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Emergency Lighting Zones</label>
                          <div className="space-y-2">
                            {projectData.escape_routes.emergency_lighting_zones.map((zone, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={zone}
                                  onChange={(e) => {
                                    const newZones = [...projectData.escape_routes.emergency_lighting_zones];
                                    newZones[index] = e.target.value;
                                    setProjectData(prev => ({
                                      ...prev,
                                      escape_routes: {
                                        ...prev.escape_routes,
                                        emergency_lighting_zones: newZones
                                      }
                                    }));
                                  }}
                                  className="flex-1 p-2 border rounded"
                                  placeholder="Enter zone description"
                                />
                                <button
                                  onClick={() => {
                                    const newZones = projectData.escape_routes.emergency_lighting_zones.filter((_, i) => i !== index);
                                    setProjectData(prev => ({
                                      ...prev,
                                      escape_routes: {
                                        ...prev.escape_routes,
                                        emergency_lighting_zones: newZones
                                      }
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newZones = [...projectData.escape_routes.emergency_lighting_zones, ''];
                                setProjectData(prev => ({
                                  ...prev,
                                  escape_routes: {
                                    ...prev.escape_routes,
                                    emergency_lighting_zones: newZones
                                  }
                                }));
                              }}
                              className="btn-secondary flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Zone</span>
                            </button>
                          </div>
                        </div>

                        {/* Door Rotation Diagrams */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Door Rotation Diagrams</label>
                          <div className="flex flex-wrap gap-4">
                            {projectData.escape_routes.door_rotation_diagrams.map((diagram, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={diagram}
                                  alt={`Door Rotation Diagram ${index + 1}`}
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => {
                                    const newDiagrams = projectData.escape_routes.door_rotation_diagrams.filter((_, i) => i !== index);
                                    setProjectData(prev => ({
                                      ...prev,
                                      escape_routes: {
                                        ...prev.escape_routes,
                                        door_rotation_diagrams: newDiagrams
                                      }
                                    }));
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
                                const newDiagrams = [...projectData.escape_routes.door_rotation_diagrams, 'placeholder.jpg'];
                                setProjectData(prev => ({
                                  ...prev,
                                  escape_routes: {
                                    ...prev.escape_routes,
                                    door_rotation_diagrams: newDiagrams
                                  }
                                }));
                              }}
                              className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                              <Upload className="w-8 h-8" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signage */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Signage</h3>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={projectData.signage.photoluminescent_signs}
                            onChange={(e) => setProjectData(prev => ({
                              ...prev,
                              signage: {
                                ...prev.signage,
                                photoluminescent_signs: e.target.checked
                              }
                            }))}
                            className="mr-2"
                          />
                          Photoluminescent Signs
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Special Risks & Mitigation</h2>
                  <div className="space-y-6">
                    {/* Pallet Storage */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Pallet Storage</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">FMDS 8-24 Diagram</label>
                          <div className="flex items-center space-x-4">
                            {projectData.pallet_storage.fmds_8_24_diagram && (
                              <div className="relative">
                                <img
                                  src={projectData.pallet_storage.fmds_8_24_diagram}
                                  alt="FMDS 8-24 Diagram"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    pallet_storage: {
                                      ...prev.pallet_storage,
                                      fmds_8_24_diagram: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.pallet_storage.fmds_8_24_diagram && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    pallet_storage: {
                                      ...prev.pallet_storage,
                                      fmds_8_24_diagram: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Upload className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Indoor Photo</label>
                          <div className="flex items-center space-x-4">
                            {projectData.pallet_storage.indoor_photo && (
                              <div className="relative">
                                <img
                                  src={projectData.pallet_storage.indoor_photo}
                                  alt="Indoor Pallet Storage"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    pallet_storage: {
                                      ...prev.pallet_storage,
                                      indoor_photo: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.pallet_storage.indoor_photo && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    pallet_storage: {
                                      ...prev.pallet_storage,
                                      indoor_photo: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Camera className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Oil Tanks */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Oil Tanks</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Indoor Photo</label>
                          <div className="flex items-center space-x-4">
                            {projectData.oil_tanks.indoor_photo && (
                              <div className="relative">
                                <img
                                  src={projectData.oil_tanks.indoor_photo}
                                  alt="Indoor Oil Tanks"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    oil_tanks: {
                                      ...prev.oil_tanks,
                                      indoor_photo: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.oil_tanks.indoor_photo && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    oil_tanks: {
                                      ...prev.oil_tanks,
                                      indoor_photo: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Camera className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Outdoor Photo</label>
                          <div className="flex items-center space-x-4">
                            {projectData.oil_tanks.outdoor_photo && (
                              <div className="relative">
                                <img
                                  src={projectData.oil_tanks.outdoor_photo}
                                  alt="Outdoor Oil Tanks"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    oil_tanks: {
                                      ...prev.oil_tanks,
                                      outdoor_photo: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.oil_tanks.outdoor_photo && (
                              <button
                                onClick={() => {
                                  // Add file upload logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    oil_tanks: {
                                      ...prev.oil_tanks,
                                      outdoor_photo: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Camera className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={projectData.oil_tanks.bunding_compliant}
                              onChange={(e) => setProjectData(prev => ({
                                ...prev,
                                oil_tanks: {
                                  ...prev.oil_tanks,
                                  bunding_compliant: e.target.checked
                                }
                              }))}
                              className="mr-2"
                            />
                            Bunding Compliant
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Final Summary & Recommendations</h2>
                  <div className="space-y-6">
                    {/* Mandatory Actions */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Mandatory Actions</h3>
                      <div className="space-y-2">
                        {projectData.mandatory_actions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={action}
                              onChange={(e) => {
                                const newActions = [...projectData.mandatory_actions];
                                newActions[index] = e.target.value;
                                setProjectData(prev => ({
                                  ...prev,
                                  mandatory_actions: newActions
                                }));
                              }}
                              className="flex-1 p-2 border rounded"
                              placeholder="Enter mandatory action"
                            />
                            <button
                              onClick={() => {
                                const newActions = projectData.mandatory_actions.filter((_, i) => i !== index);
                                setProjectData(prev => ({
                                  ...prev,
                                  mandatory_actions: newActions
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newActions = [...projectData.mandatory_actions, ''];
                            setProjectData(prev => ({
                              ...prev,
                              mandatory_actions: newActions
                            }));
                          }}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Mandatory Action</span>
                        </button>
                      </div>
                    </div>

                    {/* Optional Actions */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Optional Actions</h3>
                      <div className="space-y-2">
                        {projectData.optional_actions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={action}
                              onChange={(e) => {
                                const newActions = [...projectData.optional_actions];
                                newActions[index] = e.target.value;
                                setProjectData(prev => ({
                                  ...prev,
                                  optional_actions: newActions
                                }));
                              }}
                              className="flex-1 p-2 border rounded"
                              placeholder="Enter optional action"
                            />
                            <button
                              onClick={() => {
                                const newActions = projectData.optional_actions.filter((_, i) => i !== index);
                                setProjectData(prev => ({
                                  ...prev,
                                  optional_actions: newActions
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newActions = [...projectData.optional_actions, ''];
                            setProjectData(prev => ({
                              ...prev,
                              optional_actions: newActions
                            }));
                          }}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Optional Action</span>
                        </button>
                      </div>
                    </div>

                    {/* Engineer Signoff */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-xl font-semibold mb-4">Engineer Signoff</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Engineer Name</label>
                          <input
                            type="text"
                            value={projectData.engineer_signoff.name}
                            onChange={(e) => setProjectData(prev => ({
                              ...prev,
                              engineer_signoff: {
                                ...prev.engineer_signoff,
                                name: e.target.value
                              }
                            }))}
                            className="w-full p-2 border rounded"
                            placeholder="Enter engineer name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">ECSA Number</label>
                          <input
                            type="text"
                            value={projectData.engineer_signoff.ecsa_number}
                            onChange={(e) => setProjectData(prev => ({
                              ...prev,
                              engineer_signoff: {
                                ...prev.engineer_signoff,
                                ecsa_number: e.target.value
                              }
                            }))}
                            className="w-full p-2 border rounded"
                            placeholder="Enter ECSA number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Signature</label>
                          <div className="flex items-center space-x-4">
                            {projectData.engineer_signoff.signature && (
                              <div className="relative">
                                <img
                                  src={projectData.engineer_signoff.signature}
                                  alt="Engineer Signature"
                                  className="w-32 h-32 object-cover rounded"
                                />
                                <button
                                  onClick={() => setProjectData(prev => ({
                                    ...prev,
                                    engineer_signoff: {
                                      ...prev.engineer_signoff,
                                      signature: ''
                                    }
                                  }))}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {!projectData.engineer_signoff.signature && (
                              <button
                                onClick={() => {
                                  // Add signature capture logic here
                                  setProjectData(prev => ({
                                    ...prev,
                                    engineer_signoff: {
                                      ...prev.engineer_signoff,
                                      signature: 'placeholder.jpg'
                                    }
                                  }));
                                }}
                                className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <Upload className="w-8 h-8" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`${buttonStyles} btn-secondary disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={step === totalSteps}
                  className={`${buttonStyles} btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectWizard; 