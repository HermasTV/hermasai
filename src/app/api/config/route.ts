import { NextRequest, NextResponse } from 'next/server';

// API endpoint to get dynamic configuration
export async function GET(request: NextRequest) {
  try {
    const config = {
      pdfConverterUrl: process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                      process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                      'http://127.0.0.1:8000'
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