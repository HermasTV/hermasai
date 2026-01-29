import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('[DEBUG API] Debug endpoint called')

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI?.length || 0,
        mongoUriStart: process.env.MONGODB_URI?.substring(0, 30) + '...',
        hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
        payloadSecretLength: process.env.PAYLOAD_SECRET?.length || 0,
        hasS3Bucket: !!process.env.S3_BUCKET,
        s3Bucket: process.env.S3_BUCKET || 'not set',
        s3Region: process.env.S3_REGION || 'not set',
        hasS3AccessKey: !!process.env.S3_ACCESS_KEY_ID,
        hasS3SecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
        hasServerUrl: !!process.env.NEXT_PUBLIC_SERVER_URL,
        serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'not set',
      },
    }

    console.log('[DEBUG API] Debug info:', JSON.stringify(debugInfo, null, 2))

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('[DEBUG API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get debug info',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
