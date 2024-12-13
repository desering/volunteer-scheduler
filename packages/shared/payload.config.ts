// this file is used for generating the typescript definitions for the collections

import { config } from "dotenv";
config({ path: "../shared/.env" });

import { buildConfig } from "payload";
import { sharedConfig } from "./shared-payload-config";

import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig(
  sharedConfig({
    baseDir: path.resolve(dirname),
  }),
);
