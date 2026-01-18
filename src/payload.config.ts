import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig, inMemoryKVAdapter } from "payload";
import sharp from "sharp";
import { Announcements } from "./collections/announcements";
import { EventTemplates } from "./collections/event-templates";
import { Events } from "./collections/events";
import { Roles } from "./collections/roles";
import { Sections } from "./collections/sections";
import { Signups } from "./collections/signups";
import { Tags } from "./collections/tags";
import { UserNotificationPreferences } from "./collections/user-notification-preferences";
import { Users } from "./collections/users";
import { editor } from "./editor.config";
import { logger } from "./lib/logger";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
    return "";
  }

  if (!process.env.COOLIFY_BRANCH) {
    logger.debug("Database connection string: no modifications");
    return process.env.DATABASE_URI;
  }

  if (process.env.COOLIFY_BRANCH === "main") {
    logger.debug("Database connection string: no modifications");
    return process.env.DATABASE_URI;
  }

  logger.debug(
    { branch: process.env.COOLIFY_BRANCH },
    "Database connection string: using COOLIFY_BRANCH",
  );

  const prNumber = process.env.COOLIFY_BRANCH.match(/\/(\d+)\//)?.[1];
  return `${process.env.DATABASE_URI}-pr-${prNumber}`;
};

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: "dd/MM/yyyy HH:mm",
    timezones: {
      defaultTimezone: "Europe/Amsterdam",
      supportedTimezones: [
        {
          label: "Europe/Amsterdam",
          value: "Europe/Amsterdam",
        },
      ],
    },
    components: {
      beforeNavLinks: ["@/components/admin/back-to-schedule#BackToSchedule"],
      beforeDashboard: ["@/components/dashboard-header#DashboardHeader"],

      views: {
        calendar: {
          Component: "/views/calendar-view#CalendarView",
          path: "/calendar/:collectionSlug",
        },
      },
    },
  },

  routes: {
    api: "/payload-api",
  },

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  cors: [process.env.NEXT_PUBLIC_SERVER_URL ?? ""].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL ?? ""].filter(Boolean),

  collections: [
    Announcements,
    EventTemplates,
    Events,
    Roles,
    Sections,
    Signups,
    Tags,
    UserNotificationPreferences,
    Users,
  ],
  editor,
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getConnectionString(),
    },
    prodMigrations: migrations,
    push: process.env.NODE_ENV !== "production",
  }),
  kv: inMemoryKVAdapter(),
  email: nodemailerAdapter(
    process.env.SMTP_HOST
      ? {
          defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || "",
          defaultFromName: process.env.EMAIL_FROM_NAME || "",
          transportOptions: {
            host: process.env.SMTP_HOST || "localhost",
            auth: {
              user: process.env.SMTP_USER || undefined,
              pass: process.env.SMTP_PASS || undefined,
            },
            port: process.env.SMTP_PORT
              ? parseInt(process.env.SMTP_PORT, 10)
              : 1025,
          },
        }
      : undefined,
  ),
  sharp,
  plugins: [],
});
