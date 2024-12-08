import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

config({ path: path.resolve(dirname, ".env") });

import process from "node:process";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Roles } from "./collections/roles";
import { Sections } from "./collections/sections";
import { Shifts } from "./collections/shifts";
import { Signups } from "./collections/signups";
import { Users } from "./collections/users";

export default buildConfig({
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
	editor: lexicalEditor(),
	plugins: [],
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
	sharp,
});
