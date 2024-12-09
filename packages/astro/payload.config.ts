import {
	HTMLConverterFeature,
	lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import { sharedConfig } from "../shared/shared-payload-config";

export default buildConfig({
	...sharedConfig,
	editor: lexicalEditor({
		features: ({ defaultFeatures }) => [
			...defaultFeatures,
			HTMLConverterFeature({}),
		],
	}),
});
