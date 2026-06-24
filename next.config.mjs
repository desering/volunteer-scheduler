import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "*": ["node_modules/jose/**"],
  },
  serverExternalPackages: ["@datadog/pprof"],
};

export default withPayload(nextConfig);
