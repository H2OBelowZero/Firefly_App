import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { placeholderPositions } from '../config/pdf-placeholders';

interface PlaceholderValues {
  [key: string]: string;
}

type ApiResponse = NextApiResponse<Buffer | { message: string; error?: string }>;

export default async function handler(
  req: NextApiRequest,
  res: ApiResponse
) {
  console.log('API handler started');
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({ message: 'Request body is required' });
    }

    const { projectId, placeholders, templatePath } = req.body as {
      projectId: string;
      placeholders: PlaceholderValues;
      templatePath: string;
    };

    console.log('Extracted parameters:', {
      projectId,
      placeholdersCount: Object.keys(placeholders).length,
      templatePath
    });

    if (!projectId || !placeholders || !templatePath) {
      console.error('Missing parameters:', { projectId, placeholders, templatePath });
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Check if template file exists
    const templateFilePath = path.join(process.cwd(), 'public', templatePath);
    console.log('Looking for template file at:', templateFilePath);
    
    if (!fs.existsSync(templateFilePath)) {
      console.error('Template file not found at:', templateFilePath);
      return res.status(404).json({ message: 'Template file not found' });
    }

    console.log('Reading template file...');
    // Read the template PDF file
    const templateBuffer = fs.readFileSync(templateFilePath);
    console.log('Template file read successfully, size:', templateBuffer.length);

    if (templateBuffer.length === 0) {
      console.error('Template file is empty');
      return res.status(500).json({ message: 'Template file is empty' });
    }

    console.log('Loading PDF document...');
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(templateBuffer);
      console.log('PDF document loaded successfully');
    } catch (pdfError) {
      console.error('Error loading PDF:', pdfError);
      return res.status(500).json({ message: 'Failed to load PDF template' });
    }

    console.log('Embedding font...');
    let font;
    try {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      console.log('Font embedded successfully');
    } catch (fontError) {
      console.error('Error embedding font:', fontError);
      return res.status(500).json({ message: 'Failed to embed font' });
    }

    // Get all pages
    const pages = pdfDoc.getPages();
    console.log('Number of pages:', pages.length);

    if (pages.length === 0) {
      console.error('PDF has no pages');
      return res.status(500).json({ message: 'PDF template has no pages' });
    }

    console.log('Processing placeholders:', placeholders);
    // Replace placeholders in each page
    for (const [placeholder, value] of Object.entries(placeholders)) {
      console.log(`Processing placeholder: ${placeholder} with value: ${value}`);
      if (value && placeholderPositions[placeholder]) {
        const position = placeholderPositions[placeholder];
        console.log(`Found position for ${placeholder}:`, position);
        
        const page = pages[position.page - 1]; // Convert to 0-based index

        if (page) {
          console.log(`Drawing text for ${placeholder} on page ${position.page}`);
          try {
            // Draw the text at the specified position
            page.drawText(value, {
              x: position.x,
              y: position.y,
              size: position.fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            console.log(`Successfully drew text for ${placeholder}`);
          } catch (drawError) {
            console.error(`Error drawing text for ${placeholder}:`, drawError);
            return res.status(500).json({ message: `Failed to draw text for ${placeholder}` });
          }
        } else {
          console.error(`Page ${position.page} not found for placeholder ${placeholder}`);
        }
      } else {
        console.log(`No position found for placeholder: ${placeholder}`);
      }
    }

    console.log('Saving modified PDF...');
    let modifiedPdfBytes;
    try {
      modifiedPdfBytes = await pdfDoc.save();
      console.log('PDF saved successfully, size:', modifiedPdfBytes.length);
    } catch (saveError) {
      console.error('Error saving PDF:', saveError);
      return res.status(500).json({ message: 'Failed to save modified PDF' });
    }

    if (modifiedPdfBytes.length === 0) {
      console.error('Generated PDF is empty');
      return res.status(500).json({ message: 'Generated PDF is empty' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=modified-document.pdf');

    // Send the modified PDF
    console.log('Sending response...');
    res.status(200).send(Buffer.from(modifiedPdfBytes));
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error generating document:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we're sending a proper JSON response for errors
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate document',
      error: error instanceof Error ? error.stack : undefined
    });
  }
} 