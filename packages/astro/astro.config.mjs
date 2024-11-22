// @ts-check
import solid from "@astrojs/solid-js";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  server: { port: 3000, host: true },
  integrations: [solid()],
  vite: {
    server: {
      fs: {
        allow: [
          "..",
        ],
      },
    },
  },

  experimental: {
    env: {
      schema: {
        PAYLOAD_SECRET: envField.string({
          context: "server",
          access: "secret",
        }),
      },
    },
  },
});
