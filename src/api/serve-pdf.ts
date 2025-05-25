import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'document template', 'Report_Template_250324[1].pdf');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('PDF file not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Return the PDF file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Error serving PDF', { status: 500 });
  }
} 