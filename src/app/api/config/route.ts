import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'runtime-config.json');

// API endpoint to get dynamic configuration
export async function GET(request: NextRequest) {
  try {
    let pdfConverterUrl;

    // Try to read runtime configuration first
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf8');
      const runtimeConfig = JSON.parse(data);
      pdfConverterUrl = runtimeConfig.pythonServicesUrl;
    } catch {
      // Fallback to environment variables if runtime config doesn't exist
      pdfConverterUrl = process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                       process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                       'http://127.0.0.1:8000';
    }

    const config = {
      pdfConverterUrl
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}