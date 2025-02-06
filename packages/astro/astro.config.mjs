import { config } from "dotenv";
config({ path: "../shared/.env" });

import node from "@astrojs/node";
import solid from "@astrojs/solid-js";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  server: { port: 3000, host: true },
  integrations: [solid()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),

  vite: {
    server: {
      fs: {
        allow: [
          "..",
          "../..", // allow reading from the root of the monorepo
        ],
      },
    },
  },

  env: {
    schema: {
      PAYLOAD_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  redirects: {
    "/": "/events",
  },
});
