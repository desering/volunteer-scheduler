import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		turbo: false,
	},
};

export default withPayload(nextConfig);
