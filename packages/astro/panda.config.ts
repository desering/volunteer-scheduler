import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import olive from "@park-ui/panda-preset/colors/olive";
import sand from "@park-ui/panda-preset/colors/sand";

export default defineConfig({
  preflight: true,
  presets: [
    createPreset({
      accentColor: olive,
      grayColor: sand,
      radius: "2xl",
    }),
  ],
  include: [
    "./src/**/*.{ts,tsx,js,jsx,astro}",
    "./pages/**/*.{ts,tsx,js,jsx,astro}",
  ],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "solid",
  jsxFactory: "panda",
  theme: {
    extend: {
      recipes: {
        button: {
          variants: {
            variant: {
              // outline: {
              //   borderWidth: "2px",
              //   borderColor: "colorPalette.12",
              //   _focusVisible: {
              //     outline: "2px solid",
              //     outlineColor: "colorPalette.12",
              //     outlineOffset: "2px",
              //   },
              // },
            },
          },
        },
        input: {
          base: {
            // borderWidth: "2px",
            // borderColor: "colorPalette.12",
          },
        },
      },
    },
  },
});
