import { NextRequest, NextResponse } from 'next/server';
import { readConfig } from '@/utils/dynamodb';

// API endpoint to get dynamic configuration
export async function GET(request: NextRequest) {
  try {
    const runtimeConfig = await readConfig();
    const config = {
      pdfConverterUrl: runtimeConfig.pythonServicesUrl
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);

    // Fallback to environment variables if DynamoDB fails
    const fallbackUrl = process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                       process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                       'http://127.0.0.1:8000';

    return NextResponse.json({
      pdfConverterUrl: fallbackUrl
    });
  }
}