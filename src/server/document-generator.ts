import express, { Request, Response, Router } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GenerateDocumentRequest {
  projectId: string;
  placeholders: Record<string, string>;
  templatePath: string;
}

const app = express();

// Configure CORS
app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// Define the route directly on the app
app.post('/generate-document', (req: Request<{}, {}, GenerateDocumentRequest>, res: Response) => {
  const handleRequest = async () => {
    try {
      console.log('Received request:', JSON.stringify(req.body, null, 2));
      const { projectId, placeholders, templatePath } = req.body;

      if (!projectId || !placeholders || !templatePath) {
        console.error('Missing required parameters:', { projectId, placeholders, templatePath });
        return res.status(400).json({ 
          message: 'Missing required parameters',
          details: {
            projectId: !projectId,
            placeholders: !placeholders,
            templatePath: !templatePath
          }
        });
      }

      // Check if template file exists
      const templateFilePath = path.resolve(process.cwd(), 'public', decodeURIComponent(templatePath));
      console.log('Looking for template file at:', templateFilePath);
      
      if (!fs.existsSync(templateFilePath)) {
        console.error('Template file not found at:', templateFilePath);
        return res.status(404).json({ 
          message: 'Template file not found',
          path: templateFilePath,
          requestedPath: templatePath,
          decodedPath: decodeURIComponent(templatePath)
        });
      }

      // Read the template PDF file
      let templateBuffer: Buffer;
      try {
        templateBuffer = fs.readFileSync(templateFilePath);
        console.log('Template file read successfully, size:', templateBuffer.length);
      } catch (readError) {
        console.error('Error reading template file:', readError);
        return res.status(500).json({ 
          message: 'Error reading template file',
          error: readError instanceof Error ? readError.message : 'Unknown error'
        });
      }

      if (templateBuffer.length === 0) {
        return res.status(500).json({ message: 'Template file is empty' });
      }

      try {
        // Load the PDF document
        console.log('Loading PDF document...');
        const pdfDoc = await PDFDocument.load(templateBuffer);
        console.log('PDF document loaded successfully');

        // Embed font
        console.log('Embedding font...');
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        console.log('Font embedded successfully');

        // Get all pages
        const pages = pdfDoc.getPages();
        console.log('Number of pages:', pages.length);

        if (pages.length === 0) {
          return res.status(500).json({ message: 'PDF template has no pages' });
        }

        // Replace placeholders in each page
        console.log('Replacing placeholders...');
        
        // Define the positions for each placeholder
        const placeholderPositions: Record<string, { x: number; y: number }> = {
          // Project Info
          'company_name': { x: 100, y: 700 },
          'client_name': { x: 100, y: 680 },
          'facility_process': { x: 100, y: 660 },
          'construction_year': { x: 100, y: 640 },
          
          // Location
          'town': { x: 100, y: 600 },
          'province': { x: 100, y: 580 },
          
          // Buildings
          'building_1_name': { x: 100, y: 540 },
          'building_1_classification': { x: 100, y: 520 },
          'building_1_area': { x: 100, y: 500 },
          'building_1_description': { x: 100, y: 480 },
          
          // Special Risks
          'risk_1_type': { x: 100, y: 440 },
          'risk_1_location': { x: 100, y: 420 },
          'risk_1_details': { x: 100, y: 400 },
          'risk_1_description': { x: 100, y: 380 },
          
          // Escape Routes
          'escape_route_1_name': { x: 100, y: 340 },
          'escape_route_1_travel_distance': { x: 100, y: 320 },
          'escape_route_1_width': { x: 100, y: 300 },
          
          // Emergency Staircases
          'emergency_staircase_1_name': { x: 100, y: 260 },
          'emergency_staircase_1_width': { x: 100, y: 240 },
          'emergency_staircase_1_fire_rated': { x: 100, y: 220 },
          
          // Signage
          'signage_1_type': { x: 100, y: 180 },
          'signage_1_location': { x: 100, y: 160 },
          'signage_1_photoluminescent': { x: 100, y: 140 },
          
          // Emergency Lighting Zones
          'emergency_lighting_1_name': { x: 100, y: 100 },
          'emergency_lighting_1_duration': { x: 100, y: 80 },
          'emergency_lighting_1_lux_level': { x: 100, y: 60 },
          
          // Fire Hose Reels
          'fire_hose_reel_1_location': { x: 300, y: 700 },
          'fire_hose_reel_1_length': { x: 300, y: 680 },
          'fire_hose_reel_1_coverage_radius': { x: 300, y: 660 },
          
          // Fire Extinguishers
          'fire_extinguisher_1_type': { x: 300, y: 620 },
          'fire_extinguisher_1_location': { x: 300, y: 600 },
          'fire_extinguisher_1_capacity': { x: 300, y: 580 },
          
          // Fire Hydrants
          'fire_hydrant_1_location': { x: 300, y: 540 },
          'fire_hydrant_1_type': { x: 300, y: 520 },
          'fire_hydrant_1_flow_rate': { x: 300, y: 500 },
          
          // Firewater
          'firewater_source': { x: 300, y: 460 },
          'firewater_capacity': { x: 300, y: 440 },
          'firewater_pressure': { x: 300, y: 420 },
        };

        // Get the first page
        const page = pages[0];
        
        // Replace each placeholder with its value
        for (const [placeholder, value] of Object.entries(placeholders)) {
          if (value) {
            try {
              const position = placeholderPositions[placeholder];
              if (position) {
                // Draw the text at the specified position
                page.drawText(value.toString(), {
                  x: position.x,
                  y: position.y,
                  size: 12,
                  font,
                  color: rgb(0, 0, 0),
                });
                console.log(`Successfully placed text for placeholder [${placeholder}] at position (${position.x}, ${position.y})`);
              } else {
                console.warn(`No position defined for placeholder: [${placeholder}]`);
              }
            } catch (drawError) {
              console.error(`Error replacing placeholder [${placeholder}]:`, drawError);
              // Continue with other placeholders even if one fails
            }
          }
        }

        // Save the modified PDF
        console.log('Saving modified PDF...');
        const modifiedPdfBytes = await pdfDoc.save();
        console.log('PDF saved successfully, size:', modifiedPdfBytes.length);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=modified-document.pdf');

        // Send the modified PDF
        res.send(Buffer.from(modifiedPdfBytes));
      } catch (pdfError) {
        console.error('Error processing PDF:', pdfError);
        return res.status(500).json({ 
          message: 'Error processing PDF template',
          error: pdfError instanceof Error ? pdfError.message : 'Unknown error',
          stack: pdfError instanceof Error ? pdfError.stack : undefined
        });
      }
    } catch (error) {
      console.error('Error generating document:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to generate document',
        error: error instanceof Error ? error.stack : undefined
      });
    }
  };

  handleRequest().catch(error => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Document generator server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
}); 