import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Save, RotateCw } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface Placeholder {
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'file' | 'checkbox';
  category?: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in DocumentEditor:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-red-500 mb-4">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DocumentEditor: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [projectData, setProjectData] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isReloading, setIsReloading] = useState(false);

  const PDF_PATH = '/document template/Report_Template_250324.pdf';
  const getTemplatePath = () => {
    // Remove leading slash for server path
    return PDF_PATH.startsWith('/') ? PDF_PATH.slice(1) : PDF_PATH;
  };

  const fetchProjectData = async () => {
    console.log('Starting fetchProjectData');
    if (!projectId) {
      console.log('No project ID provided');
      return;
    }

    console.log('Fetching project data for ID:', projectId);
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          buildings (*),
          areas (*),
          rooms (*),
          special_risks (*),
          expected_commodities (*)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Project fetch error:', error);
        throw error;
      }

      if (!project) {
        console.log('No project data found');
        return;
      }

      console.log('Project data fetched successfully:', project);
      setProjectData(project);
    } catch (error) {
      console.error('Error in fetchProjectData:', error);
      toast.error('Failed to load project data. Please try again.');
    }
  };

  useEffect(() => {
    console.log('Initial useEffect triggered');
    if (!projectId) {
      console.error('No project ID provided');
      toast.error('No project ID provided');
      navigate('/projects');
      return;
    }
    fetchProjectData();
  }, [projectId, navigate]);

  const extractPlaceholders = (data: any) => {
    try {
      console.log('Starting placeholder extraction with data:', data);
      const extracted: Placeholder[] = [];
      
      // Basic project info
      if (data.company_name) extracted.push({ name: 'company_name', value: data.company_name, type: 'text', category: 'Project Info' });
      if (data.client_name) extracted.push({ name: 'client_name', value: data.client_name, type: 'text', category: 'Project Info' });
      if (data.facility_process) extracted.push({ name: 'facility_process', value: data.facility_process, type: 'text', category: 'Project Info' });
      if (data.construction_year) extracted.push({ name: 'construction_year', value: data.construction_year.toString(), type: 'number', category: 'Project Info' });
      
      // Location
      if (data.facility_location) {
        if (data.facility_location.town) extracted.push({ name: 'town', value: data.facility_location.town, type: 'text', category: 'Location' });
        if (data.facility_location.province) extracted.push({ name: 'province', value: data.facility_location.province, type: 'text', category: 'Location' });
      }

      // Buildings
      if (data.buildings && Array.isArray(data.buildings)) {
        data.buildings.forEach((building: any, index: number) => {
          if (building.name) extracted.push({ name: `building_${index + 1}_name`, value: building.name, type: 'text', category: 'Buildings' });
          if (building.classification) extracted.push({ name: `building_${index + 1}_classification`, value: building.classification, type: 'text', category: 'Buildings' });
          if (building.total_building_area) extracted.push({ name: `building_${index + 1}_area`, value: building.total_building_area.toString(), type: 'number', category: 'Buildings' });
          if (building.description) extracted.push({ name: `building_${index + 1}_description`, value: building.description, type: 'text', category: 'Buildings' });
        });
      }

      // Special Risks
      if (data.special_risks && Array.isArray(data.special_risks)) {
        data.special_risks.forEach((risk: any, index: number) => {
          if (risk.risk_type) extracted.push({ name: `risk_${index + 1}_type`, value: risk.risk_type, type: 'text', category: 'Special Risks' });
          if (risk.location) extracted.push({ name: `risk_${index + 1}_location`, value: risk.location, type: 'text', category: 'Special Risks' });
          if (risk.details) extracted.push({ name: `risk_${index + 1}_details`, value: risk.details, type: 'text', category: 'Special Risks' });
          if (risk.description) extracted.push({ name: `risk_${index + 1}_description`, value: risk.description, type: 'text', category: 'Special Risks' });
        });
      }

      // Escape Routes
      if (data.escape_routes && Array.isArray(data.escape_routes)) {
        data.escape_routes.forEach((route: any, index: number) => {
          if (route.name) extracted.push({ name: `escape_route_${index + 1}_name`, value: route.name, type: 'text', category: 'Escape Routes' });
          if (route.travel_distance) extracted.push({ name: `escape_route_${index + 1}_travel_distance`, value: route.travel_distance.toString(), type: 'number', category: 'Escape Routes' });
          if (route.width) extracted.push({ name: `escape_route_${index + 1}_width`, value: route.width.toString(), type: 'number', category: 'Escape Routes' });
        });
      }

      // Emergency Staircases
      if (data.emergency_staircases && Array.isArray(data.emergency_staircases)) {
        data.emergency_staircases.forEach((staircase: any, index: number) => {
          if (staircase.name) extracted.push({ name: `emergency_staircase_${index + 1}_name`, value: staircase.name, type: 'text', category: 'Emergency Staircase' });
          if (staircase.width) extracted.push({ name: `emergency_staircase_${index + 1}_width`, value: staircase.width.toString(), type: 'number', category: 'Emergency Staircase' });
          if (staircase.fire_rated !== undefined) extracted.push({ name: `emergency_staircase_${index + 1}_fire_rated`, value: staircase.fire_rated ? 'true' : '', type: 'checkbox', category: 'Emergency Staircase' });
        });
      }

      // Signage
      if (data.signage_items && Array.isArray(data.signage_items)) {
        data.signage_items.forEach((sign: any, index: number) => {
          if (sign.sign_type) extracted.push({ name: `signage_${index + 1}_type`, value: sign.sign_type, type: 'text', category: 'Signage' });
          if (sign.location) extracted.push({ name: `signage_${index + 1}_location`, value: sign.location, type: 'text', category: 'Signage' });
          if (sign.photoluminescent !== undefined) extracted.push({ name: `signage_${index + 1}_photoluminescent`, value: sign.photoluminescent ? 'true' : '', type: 'checkbox', category: 'Signage' });
        });
      }

      // Emergency Lighting Zones
      if (data.emergency_lighting_zones && Array.isArray(data.emergency_lighting_zones)) {
        data.emergency_lighting_zones.forEach((zone: any, index: number) => {
          if (zone.name) extracted.push({ name: `emergency_lighting_${index + 1}_name`, value: zone.name, type: 'text', category: 'Emergency Lighting Zones' });
          if (zone.duration) extracted.push({ name: `emergency_lighting_${index + 1}_duration`, value: zone.duration.toString(), type: 'number', category: 'Emergency Lighting Zones' });
          if (zone.lux_level) extracted.push({ name: `emergency_lighting_${index + 1}_lux_level`, value: zone.lux_level.toString(), type: 'number', category: 'Emergency Lighting Zones' });
        });
      }

      // Fire Hose Reels
      if (data.fire_hose_reels && Array.isArray(data.fire_hose_reels)) {
        data.fire_hose_reels.forEach((reel: any, index: number) => {
          if (reel.location) extracted.push({ name: `fire_hose_reel_${index + 1}_location`, value: reel.location, type: 'text', category: 'Fire Hose Reels' });
          if (reel.hose_length) extracted.push({ name: `fire_hose_reel_${index + 1}_length`, value: reel.hose_length.toString(), type: 'number', category: 'Fire Hose Reels' });
          if (reel.coverage_radius) extracted.push({ name: `fire_hose_reel_${index + 1}_coverage_radius`, value: reel.coverage_radius.toString(), type: 'number', category: 'Fire Hose Reels' });
        });
      }

      // Fire Extinguishers
      if (data.fire_extinguishers && Array.isArray(data.fire_extinguishers)) {
        data.fire_extinguishers.forEach((extinguisher: any, index: number) => {
          if (extinguisher.extinguisher_type) extracted.push({ name: `fire_extinguisher_${index + 1}_type`, value: extinguisher.extinguisher_type, type: 'text', category: 'Fire Extinguishers' });
          if (extinguisher.location) extracted.push({ name: `fire_extinguisher_${index + 1}_location`, value: extinguisher.location, type: 'text', category: 'Fire Extinguishers' });
          if (extinguisher.capacity) extracted.push({ name: `fire_extinguisher_${index + 1}_capacity`, value: extinguisher.capacity.toString(), type: 'number', category: 'Fire Extinguishers' });
        });
      }

      // Fire Hydrants
      if (data.fire_hydrants && Array.isArray(data.fire_hydrants)) {
        data.fire_hydrants.forEach((hydrant: any, index: number) => {
          if (hydrant.location) extracted.push({ name: `fire_hydrant_${index + 1}_location`, value: hydrant.location, type: 'text', category: 'Fire Hydrants' });
          if (hydrant.hydrant_type) extracted.push({ name: `fire_hydrant_${index + 1}_type`, value: hydrant.hydrant_type, type: 'text', category: 'Fire Hydrants' });
          if (hydrant.flow_rate) extracted.push({ name: `fire_hydrant_${index + 1}_flow_rate`, value: hydrant.flow_rate.toString(), type: 'number', category: 'Fire Hydrants' });
        });
      }

      // Firewater
      if (data.firewater) {
        if (data.firewater.source) extracted.push({ name: 'firewater_source', value: data.firewater.source, type: 'text', category: 'Firewater' });
        if (data.firewater.capacity) extracted.push({ name: 'firewater_capacity', value: data.firewater.capacity.toString(), type: 'number', category: 'Firewater' });
        if (data.firewater.pressure) extracted.push({ name: 'firewater_pressure', value: data.firewater.pressure.toString(), type: 'number', category: 'Firewater' });
      }

      console.log('Final extracted placeholders:', extracted);
      
      // Sort placeholders by category and name
      extracted.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return (a.category || '').localeCompare(b.category || '');
      });
      
      setPlaceholders(extracted);
      console.log('Placeholders set successfully');
    } catch (error) {
      console.error('Error in extractPlaceholders:', error);
      toast.error('Error processing project data');
      throw error; // Re-throw to be caught by error boundary
    }
  };

  const handlePlaceholderChange = (name: string, value: string) => {
    setPlaceholders(prev => 
      prev.map(p => {
        if (p.name === name) {
          // For file inputs, we can't set the value directly
          if (p.type === 'file') {
            return { ...p, value: '' };
          }
          return { ...p, value };
        }
        return p;
      })
    );
  };

  const formatPlaceholderName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/(\d+)/g, ' $1 ')
      .trim();
  };

  const groupedPlaceholders = placeholders.reduce((acc, placeholder) => {
    const category = placeholder.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(placeholder);
    return acc;
  }, {} as Record<string, Placeholder[]>);

  // Define the order of categories
  const categoryOrder = [
    'Project Info',
    'Location',
    'Buildings',
    'Zones',
    'Commodities',
    'Special Risks',
    'Fire Detection',
    'Firewater',
    'Escape Routes',
    'Emergency Staircase',
    'Signage',
    'Emergency Lighting Zones',
    'Fire Hose Reels',
    'Fire Extinguishers',
    'Fire Hydrants',
    'Fire Alarm Panel',
    'Smoke Ventilation',
    'Occupancy Separation',
    'Divisional Separation',
    'Automatic Fire Extinguishment Areas'
  ];

  // Sort categories according to the defined order
  const sortedCategories = Object.keys(groupedPlaceholders).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return indexA - indexB;
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('Starting document save process...');
      
      // Validate project data
      if (!projectData) {
        throw new Error('No project data available');
      }

      // Create a mapping of placeholder names to their values
      const placeholderMap = placeholders.reduce((acc, placeholder) => {
        acc[placeholder.name] = placeholder.value;
        return acc;
      }, {} as Record<string, string>);

      console.log('Placeholders to be sent:', placeholderMap);

      // Prepare the request data
      const requestData = {
        projectId,
        placeholders: placeholderMap,
        templatePath: getTemplatePath()
      };

      // Send data to n8n webhook
      const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
        try {
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({projectData}),
          });

          if (!n8nResponse.ok) {
            console.warn('Failed to send data to n8n webhook:', await n8nResponse.text());
          } else {
            console.log('Successfully sent data to n8n webhook');
          }
        } catch (n8nError) {
          console.warn('Error sending data to n8n webhook:', n8nError);
          // Don't throw error here as we still want to proceed with document generation
        }
      }

      // Validate request data
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      if (!PDF_PATH) {
        throw new Error('Template path is required');
      }

      // Verify PDF template exists before sending request
      try {
        const response = await fetch(PDF_PATH, {
          headers: {
            'Accept': 'application/pdf'
          }
        });
        if (!response.ok) {
          throw new Error('PDF template not found');
        }
        // Verify it's actually a PDF
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error('Invalid PDF file format');
        }
      } catch (error) {
        console.error('Error checking PDF template:', error);
        throw new Error('PDF template not found. Please ensure the template file exists.');
      }

      console.log('Sending request to API:', {
        url: '/api/generate-document',
        method: 'POST',
        data: requestData
      });

      // Send the request to the API
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        },
        body: JSON.stringify(requestData),
      });

      console.log('Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Check if the response is a PDF
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      if (!response.ok) {
        let errorMessage = 'Failed to generate document';
        let errorDetails = '';
        
        try {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              console.log('Parsed error data:', errorData);
              errorMessage = errorData.message || errorMessage;
              errorDetails = errorData.error || '';
              if (errorData.details) {
                errorDetails += '\nDetails: ' + JSON.stringify(errorData.details, null, 2);
              }
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (textError) {
          console.error('Error reading error response:', textError);
        }
        
        throw new Error(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
      }

      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Invalid content type:', contentType);
        throw new Error('Server did not return a PDF file');
      }

      // Get the modified PDF as a blob
      const blob = await response.blob();
      console.log('Received PDF blob:', {
        size: blob.size,
        type: blob.type
      });
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Firefly_Report_${projectData?.company_name || 'Project'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Document generated successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        toast.error(error.message || 'Failed to generate document');
      } else {
        toast.error('An unexpected error occurred while generating the document');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    setIsReloading(true);
    setPdfError(null);
    const timestamp = Date.now();
    console.log('Reloading PDF URL:', PDF_PATH);
    setPdfUrl(`${PDF_PATH}?t=${timestamp}&v=1`);
    setTimeout(() => {
      setIsReloading(false);
    }, 100);
  };

  const handlePdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setPdfError(null);
  };

  const handlePdfLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(`Failed to load PDF file. Please ensure the template file exists and is a valid PDF. Error: ${error.message}`);
    toast.error('Failed to load PDF file');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r bg-background">
          <div className="p-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Document Placeholders</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-6">
                    {sortedCategories.map((category) => (
                      <div key={category} className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          {category}
                        </h3>
                        <div className="space-y-4">
                          {groupedPlaceholders[category].map((placeholder) => (
                            <div key={placeholder.name} className="space-y-2">
                              <Label htmlFor={placeholder.name}>
                                {formatPlaceholderName(placeholder.name)}
                              </Label>
                              {placeholder.type === 'checkbox' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={placeholder.name}
                                    checked={placeholder.value === 'true'}
                                    onChange={(e) => handlePlaceholderChange(placeholder.name, e.target.checked ? 'true' : '')}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {formatPlaceholderName(placeholder.name)}
                                  </span>
                                </div>
                              ) : placeholder.type === 'file' ? (
                                <div className="flex flex-col space-y-2">
                                  <Input
                                    id={placeholder.name}
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handlePlaceholderChange(placeholder.name, file.name);
                                      }
                                    }}
                                    className="w-full"
                                  />
                                  {placeholder.value && (
                                    <span className="text-sm text-muted-foreground">
                                      Selected file: {placeholder.value}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  id={placeholder.name}
                                  type={placeholder.type === 'number' ? 'number' : 'text'}
                                  value={placeholder.value}
                                  onChange={(e) => handlePlaceholderChange(placeholder.name, e.target.value)}
                                  placeholder={`Enter ${formatPlaceholderName(placeholder.name).toLowerCase()}`}
                                  className="w-full"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                disabled={pageNumber >= numPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                onClick={handleReload}
                className="ml-2"
                disabled={isReloading}
              >
                {isReloading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Reloading...
                  </div>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Reload
                  </>
                )}
              </Button>
            </div>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Document
            </Button>
          </div>
          <div className="p-4">
            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-500 mb-2">{pdfError}</p>
                  <Button
                    variant="outline"
                    onClick={handleReload}
                    disabled={isReloading}
                  >
                    {isReloading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Reloading...
                      </div>
                    ) : (
                      <>
                        <RotateCw className="h-4 w-4 mr-2" />
                        Try Again
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Document
                file={pdfUrl}
                onLoadSuccess={handlePdfLoadSuccess}
                onLoadError={handlePdfLoadError}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-red-500 mb-2">Error loading PDF</p>
                      <Button
                        variant="outline"
                        onClick={handleReload}
                        disabled={isReloading}
                      >
                        {isReloading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Reloading...
                          </div>
                        ) : (
                          <>
                            <RotateCw className="h-4 w-4 mr-2" />
                            Try Again
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                }
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/cmaps/',
                  cMapPacked: true,
                  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/standard_fonts/',
                  disableFontFace: true,
                  useSystemFonts: true
                }}
              >
                <Page 
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={1.2}
                  className="mx-auto"
                  loading={
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                />
              </Document>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DocumentEditor;