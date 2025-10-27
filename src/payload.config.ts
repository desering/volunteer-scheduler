import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { migrations } from './migrations'

import { EventTemplates } from './collections/event-templates'
import { Events } from './collections/events'
import { Roles } from './collections/roles'
import { Sections } from './collections/sections'
import { Signups } from './collections/signups'
import { Users } from './collections/users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * This function is a workaround for Coolify Preview Deployments.
 *
 * Coolify predefined environment variables do not include a PR identifier, only
 * `COOLIFY_BRANCH` which looks like this: `COOLIFY_BRANCH=pull/56/head` and
 * cannot be directly used with PostgreSQL because database names must not
 * contain `/`.
 *
 * This function extracts the PR number from `COOLIFY_BRANCH` and appends it to
 * the connection string IF the deployment is not on the `main` branch.
 *
 * https://coolify.io/docs/applications/#preview-deployments
 * https://coolify.io/docs/knowledge-base/environment-variables/
 */
const getConnectionString = () => {
  if (!process.env.DATABASE_URI) {
    return ''
  }

  if (!process.env.COOLIFY_BRANCH) {
    console.info('Database connection string: no modifications')
    return process.env.DATABASE_URI
  }

  if (process.env.COOLIFY_BRANCH === 'main') {
    console.info('Database connection string: no modifications')
    return process.env.DATABASE_URI
  }

  console.info(`Database connection string: using COOLIFY_BRANCH (${process.env.COOLIFY_BRANCH})`)

  const prNumber = process.env.COOLIFY_BRANCH.match(/\/(\d+)\//)?.[1]
  return `${process.env.DATABASE_URI}-pr-${prNumber}`
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: 'dd/MM/yyyy HH:mm',
    timezones: {
      defaultTimezone: 'Europe/Amsterdam',
      supportedTimezones: [
        {
          label: 'Europe/Amsterdam',
          value: 'Europe/Amsterdam',
        },
      ],
    },
    components: {
      beforeDashboard: ['@/components/dashboard-header#DashboardHeader'],

      views: {
        calender: {
          Component: '/views/calender-view#CalenderView',
          path: '/calender/:collectionSlug',
        },
      },
    },
  },

  routes: {
    api: '/payload-api',
  },

  cors: [process.env.NEXT_PUBLIC_SERVER_URL ?? ''].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL ?? ''].filter(Boolean),

  collections: [Users, EventTemplates, Events, Sections, Roles, Signups],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getConnectionString(),
    },
    prodMigrations: migrations,
    push: process.env.NODE_ENV !== 'production',
  }),
  email: nodemailerAdapter(),
  sharp,
  plugins: [],
})
