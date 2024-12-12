import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig, type Config } from "payload";

import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";

import {
	HTMLConverterFeature,
	lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { Roles } from "./collections/roles";
import { Sections } from "./collections/sections";
import { Shifts } from "./collections/shifts";
import { Signups } from "./collections/signups";
import { Users } from "./collections/users";

import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const sharedConfig = (): Config => {
	if (!process.env.DATABASE_URI) {
		console.error("Please provide a DATABASE_URI in the .env file");
		// process.exit(1);
	}

	if (!process.env.PAYLOAD_SECRET) {
		console.error("Please provide a PAYLOAD_SECRET in the .env file");
		// process.exit(1);
	}

	const emailAdapter =
		process.env.EMAIL_FROM_ADDRESS &&
		process.env.EMAIL_FROM_NAME &&
		process.env.SMTP_HOST &&
		process.env.SMTP_PORT &&
		process.env.SMTP_USER &&
		process.env.SMTP_PASS
			? nodemailerAdapter({
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

	return {
		admin: {
			user: Users.slug,
			importMap: {
				baseDir: path.resolve(dirname),
			},
			dateFormat: "dd/MM/yyyy HH:mm",
		},
		collections: [Users, Shifts, Sections, Roles, Signups],
		localization: {
			defaultLocale: "en",
			locales: ["en", "nl"],
		},
		secret: process.env.PAYLOAD_SECRET || "",
		db: postgresAdapter({
			pool: {
				connectionString: process.env.DATABASE_URI,
			},
		}),
		typescript: {
			outputFile: path.resolve(dirname, "payload-types.ts"),
		},
		email: emailAdapter,

		editor: lexicalEditor({
			features: ({ defaultFeatures }) => [
				...defaultFeatures,
				HTMLConverterFeature({}),
			],
		}),
	};
};
