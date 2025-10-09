// Inject environment variables from the shared .env file into the Next.js environment
import { config } from 'dotenv'
config({ path: '../shared/.env' })

import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

export default withPayload(nextConfig)
