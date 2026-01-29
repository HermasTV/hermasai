import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('[MONGO TEST] Testing MongoDB connection...')

  const mongoUri = process.env.MONGODB_URI || 'not-set'
  console.log('[MONGO TEST] MongoDB URI exists:', !!process.env.MONGODB_URI)
  console.log('[MONGO TEST] MongoDB URI length:', mongoUri.length)
  console.log('[MONGO TEST] MongoDB URI start:', mongoUri.substring(0, 50))

  try {
    console.log('[MONGO TEST] Attempting connection...')
    const startTime = Date.now()

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      console.log('[MONGO TEST] Closing existing connection')
      await mongoose.connection.close()
    }

    // Try to connect with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 5000,
    })

    const connectTime = Date.now() - startTime
    console.log('[MONGO TEST] Connection successful! Time:', connectTime + 'ms')

    const result = {
      success: true,
      message: 'MongoDB connection successful',
      connectionTime: connectTime + 'ms',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    }

    // Close the test connection
    await mongoose.connection.close()

    console.log('[MONGO TEST] Result:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[MONGO TEST] Connection failed:', error)
    console.error('[MONGO TEST] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        mongoUriExists: !!process.env.MONGODB_URI,
        mongoUriLength: mongoUri.length,
      },
      { status: 500 }
    )
  }
}
