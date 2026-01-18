import { defineConfig, defineGlobalStyles } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import olive from "@park-ui/panda-preset/colors/olive";
import sand from "@park-ui/panda-preset/colors/sand";
import tomato from "@park-ui/panda-preset/colors/tomato";
import { alert } from "@/components/ui/recipes/alert";
import { dialog } from "@/components/ui/recipes/dialog";
import { icon } from "@/components/ui/recipes/icon";
import { sheet } from "@/components/ui/recipes/sheet";
import { toast } from "@/components/ui/recipes/toast";
import { card } from "@/components/ui/recipes/card";

const globalCss = defineGlobalStyles({
  // reset park ui conflicting global style against payload
  // use .park-ui class to scope
  "*, *::before, *::after": {},
});

export default defineConfig({
  // Avoid overriding payload styles, only reset within scope
  preflight: { scope: ".use-panda" },
  // preflight: true,
  presets: [
    createPreset({
      accentColor: olive,
      grayColor: sand,
      radius: "2xl",
    }),
  ],
  include: ["./src/**/*.{ts,tsx,js,jsx}"],
  outdir: "styled-system",
  prefix: "panda",
  // hash: true,
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
      recipes: { icon },
      slotRecipes: {
        alert,
        card,
        sheet,
        toast,
        dialog,
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
