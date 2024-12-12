// this file is used for generating the typescript definitions for the collections

import { config } from "dotenv";
config({ path: "../shared/.env" });

import { buildConfig } from "payload";
import { sharedConfig } from "./shared-payload-config";

export default buildConfig(sharedConfig());
