import { NextRequest, NextResponse } from 'next/server';
import { getPythonServicesUrl } from '@/utils/config';

// API endpoint to get configuration
export async function GET(request: NextRequest) {
  try {
    const config = {
      pdfConverterUrl: getPythonServicesUrl()
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