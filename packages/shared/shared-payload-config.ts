import type { Config } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";

import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";

import {
  HTMLConverterFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { Roles } from "./collections/roles";
import { Sections } from "./collections/sections";
import { Events } from "./collections/events";
import { Signups } from "./collections/signups";
import { Users } from "./collections/users";
import { EventTemplates } from "./collections/event-templates";

import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * This function is a workaround for Coolify Preview Deployments.
 *
 * This repo contains two applications which have independent Preview
 * Deployments that should connect to the same preview deployment database.
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
function getConnectionString() {
  if (!process.env.DATABASE_URI) {
    return "";
  }

  if (process.env.COOLIFY_BRANCH == "main") {
    return process.env.DATABASE_URI;
  }

  const prNumber = process.env.COOLIFY_BRANCH.match(/\/(\d+)\//)[1]
  return `${process.env.DATABASE_URI}-pr-${prNumber}`;
}

export const sharedConfig = ({
  baseDir,
  enableMigrations,
}: { baseDir: string; enableMigrations: boolean }): Config => ({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir,
    },
    dateFormat: "dd/MM/yyyy HH:mm",
  },
  collections: [Users, EventTemplates, Events, Sections, Roles, Signups],
  localization: {
    defaultLocale: "en",
    locales: ["en", "nl"],
  },
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: getConnectionString(),
    },
    migrationDir: enableMigrations ? "./migrations" : undefined,
    prodMigrations: enableMigrations ? migrations : undefined,
    push: process.env.NODE_ENV !== "production",
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  email: mailAdapter(),

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HTMLConverterFeature({}),
    ],
  }),
});

const mailAdapter = () =>
  process.env.EMAIL_FROM_ADDRESS &&
  process.env.EMAIL_FROM_NAME &&
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
    ? nodemailerAdapter({
        skipVerify: true,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS,
        defaultFromName: process.env.EMAIL_FROM_NAME,
        transport: nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }),
      })
    : undefined;
