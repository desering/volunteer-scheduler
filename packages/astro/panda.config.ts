import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import olive from "@park-ui/panda-preset/colors/olive";
import sand from "@park-ui/panda-preset/colors/sand";
import tomato from "@park-ui/panda-preset/colors/tomato";
import { sheet } from "~/components/ui/recipes/sheet";

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
      keyframes: {
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        "slide-out-bottom": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      tokens: {
        animations: {
          "drawer-in-bottom": {
            value: "slide-in-bottom 400ms {easings.emphasized-in}",
          },
          "drawer-out-bottom": {
            value: "slide-out-bottom 300ms {easings.emphasized-out}",
          },
        },
        colors: {
          tomato: tomato.tokens,
        },
      },
      semanticTokens: {
        colors: {
          tomato: tomato.semanticTokens,
        },
      },
      slotRecipes: {
        sheet,
        radioButtonGroup: {
          variants: {
            direction: {
              horizontal: {},
              vertical: {
                root: {
                  display: "flex",
                  flexDirection: "column",
                },
              },
            },
          },
        },
      },
    },
  },
});
