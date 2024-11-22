import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import grass from "@park-ui/panda-preset/colors/grass";
import sand from "@park-ui/panda-preset/colors/sand";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({
      accentColor: grass,
      grayColor: sand,
      radius: "2xl",
    }),
  ],
  include: [
    "./src/**/*.{ts,tsx,js,jsx,astro}",
    "./pages/**/*.{ts,tsx,js,jsx,astro}",
  ],
  exclude: [],
  theme: {
    extend: {},
  },
  outdir: "styled-system",
  jsxFramework: "solid",
});
