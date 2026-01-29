import { RootPage } from '@payloadcms/next/views'
import { S3ClientUploadHandler } from '@payloadcms/storage-s3/client'

export const importMap = {
  '@payloadcms/next/views#RootPage': RootPage,
  '@payloadcms/storage-s3/client#S3ClientUploadHandler': S3ClientUploadHandler,
}
