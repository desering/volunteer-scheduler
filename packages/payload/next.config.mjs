import { config } from "dotenv";
config({ path: "../shared/.env" });

import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		turbo: false,
	},
	output: "standalone",
};

export default withPayload(nextConfig);
