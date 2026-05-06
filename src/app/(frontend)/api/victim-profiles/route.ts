import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Returns a lightweight map of { dataIndex: slug } for all profiles.
// Used by the particle visualization to know which particles have a profile.
export async function GET() {
  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'victim-profiles',
      limit: 100000,
      depth: 0,
      select: {
        dataIndex: true,
        slug: true,
        picture: true,
      },
    })

    const map: Record<number, { slug: string; hasPicture: boolean }> = {}
    for (const doc of docs) {
      if (doc.dataIndex !== undefined && doc.slug) {
        map[doc.dataIndex] = {
          slug: doc.slug,
          hasPicture: !!doc.picture,
        }
      }
    }

    return NextResponse.json(map, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
