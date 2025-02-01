import { defineConfig, defineGlobalStyles } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import neutral from "@park-ui/panda-preset/colors/neutral";
import sand from "@park-ui/panda-preset/colors/sand";

const globalCss = defineGlobalStyles({
  // reset park ui conflicting global style against payload
  "*, *::before, *::after": {},
});

export default defineConfig({
  // Don't reset payload css
  preflight: { scope: ".panda" },
  presets: [
    createPreset({
      accentColor: neutral,
      grayColor: sand,
      radius: "none",
    }),
  ],
  include: ["./src/**/*.{ts,tsx,js,jsx}"],
  outdir: "styled-system",
  jsxFactory: "panda",
  jsxFramework: "react",
  globalCss,
  conditions: {
    extend: {
      // react to dark mode from payload
      dark: '.dark &, [data-theme="dark"] &',
    },
  },
  theme: {
    extend: {
      recipes: {
        button: {
          base: {
            borderWidth: 0,
          },
        },
      },
    },
  },
});
