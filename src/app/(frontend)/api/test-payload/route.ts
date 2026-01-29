import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('[PAYLOAD TEST] Testing Payload CMS initialization...')

  try {
    console.log('[PAYLOAD TEST] Getting Payload instance...')
    const startTime = Date.now()

    const payload = await getPayload({ config })
    const initTime = Date.now() - startTime

    console.log('[PAYLOAD TEST] Payload initialized successfully! Time:', initTime + 'ms')

    // Try to query the database
    console.log('[PAYLOAD TEST] Testing database query...')
    const queryStart = Date.now()
    const { totalDocs } = await payload.find({
      collection: 'posts',
      limit: 1,
    })
    const queryTime = Date.now() - queryStart

    console.log('[PAYLOAD TEST] Query successful! Posts count:', totalDocs)

    const result = {
      success: true,
      message: 'Payload CMS is working',
      initializationTime: initTime + 'ms',
      queryTime: queryTime + 'ms',
      postsCount: totalDocs,
      timestamp: new Date().toISOString(),
    }

    console.log('[PAYLOAD TEST] Result:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[PAYLOAD TEST] Test failed:', error)
    console.error('[PAYLOAD TEST] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Payload CMS test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      },
      { status: 500 }
    )
  }
}
