import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { sharedConfig } from "../shared/shared-payload-config";

export default buildConfig({
	...sharedConfig,
	editor: lexicalEditor(),
	plugins: [],
	sharp,
});
