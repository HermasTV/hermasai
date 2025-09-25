import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/utils/adminAuth';
import { readConfig, writeConfig, type ConfigData } from '@/utils/dynamodb';

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

    const { pythonServicesUrl, adminUsername, adminPassword } = await request.json();

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
    const newConfig: ConfigData = {
      ...currentConfig,
      pythonServicesUrl,
      ...(adminUsername && { adminUsername }),
      ...(adminPassword && { adminPassword }),
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