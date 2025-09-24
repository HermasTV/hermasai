import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/utils/adminAuth';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'runtime-config.json');

// Default configuration
const DEFAULT_CONFIG = {
  pythonServicesUrl: process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL ||
                     process.env.NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV ||
                     'http://127.0.0.1:8000',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

// Helper function to read configuration
async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, create it with default config
    await writeConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
}

// Helper function to write configuration
async function writeConfig(config: any) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// GET: Retrieve current configuration
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!verifyAdminAuth()) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const config = await readConfig();
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Config read error:', error);
    return NextResponse.json({
      error: 'Failed to read configuration'
    }, { status: 500 });
  }
}

// POST: Update configuration
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!verifyAdminAuth()) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { pythonServicesUrl } = await request.json();

    if (!pythonServicesUrl) {
      return NextResponse.json({
        error: 'Python Services URL is required'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(pythonServicesUrl);
    } catch {
      return NextResponse.json({
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    const currentConfig = await readConfig();
    const newConfig = {
      ...currentConfig,
      pythonServicesUrl,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    };

    await writeConfig(newConfig);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: newConfig
    });
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json({
      error: 'Failed to update configuration'
    }, { status: 500 });
  }
}