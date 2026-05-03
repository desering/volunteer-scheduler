import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "*": ["node_modules/jose/**"],
  },
  productionBrowserSourceMaps: true,
};

export default withPayload(nextConfig);
