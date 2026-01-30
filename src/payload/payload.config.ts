import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Debug logging
console.log('[PAYLOAD CONFIG] Starting Payload CMS configuration...')
console.log('[PAYLOAD CONFIG] Environment:', process.env.NODE_ENV)
console.log('[PAYLOAD CONFIG] MongoDB URI exists:', !!process.env.MONGODB_URI)
console.log('[PAYLOAD CONFIG] MongoDB URI length:', process.env.MONGODB_URI?.length || 0)
console.log('[PAYLOAD CONFIG] MongoDB URI preview:', process.env.MONGODB_URI?.substring(0, 50) + '...')
console.log('[PAYLOAD CONFIG] Payload Secret exists:', !!process.env.PAYLOAD_SECRET)
console.log('[PAYLOAD CONFIG] S3 Bucket:', process.env.S3_BUCKET)
console.log('[PAYLOAD CONFIG] S3 Region:', process.env.S3_REGION)
console.log('[PAYLOAD CONFIG] S3 Access Key exists:', !!process.env.S3_ACCESS_KEY_ID)
console.log('[PAYLOAD CONFIG] S3 Secret Key exists:', !!process.env.S3_SECRET_ACCESS_KEY)

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hermasai'
console.log('[PAYLOAD CONFIG] Using MongoDB URI:', mongoUri.substring(0, 50) + '...')

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Authors, Categories, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: mongoUri,
    // Serverless-optimized connection settings
    connectOptions: {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10, // Maximum 10 connections in pool
      minPoolSize: 1, // Minimum 1 connection
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      retryWrites: true,
      retryReads: true,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
          prefix: 'media',
          generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
            const bucket = process.env.S3_BUCKET || 'hermasai-media'
            const region = process.env.S3_REGION || 'us-east-1'
            const path = prefix ? `${prefix}/${filename}` : filename
            return `https://${bucket}.s3.${region}.amazonaws.com/${path}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'hermasai-media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
      },
    }),
  ],
  sharp,
})
