import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

config({ path: path.resolve(dirname, ".env") });

import { postgresAdapter } from "@payloadcms/db-postgres";
import process from "node:process";
import type { Config } from "payload";

import { Roles } from "./collections/roles";
import { Sections } from "./collections/sections";
import { Shifts } from "./collections/shifts";
import { Signups } from "./collections/signups";
import { Users } from "./collections/users";

export const sharedConfig: Config = {
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
			connectionString: process.env.DATABASE_URI || "",
		},
	}),
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
};
