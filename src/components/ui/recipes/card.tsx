import { defineSlotRecipe } from "@pandacss/dev";

export const card = defineSlotRecipe({
  className: "card",
  slots: ["root", "header", "body", "footer", "title", "description"],
  base: {
    root: {
      borderRadius: "l3",
      display: "flex",
      overflow: "hidden",
      position: "relative",
      gap: "6",
      padding: "6",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
    },
    body: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "3",
    },
    title: {
      textStyle: "lg",
      fontWeight: "semibold",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
  },
  defaultVariants: {
    variant: "outline",
    direction: "vertical",
  },
  variants: {
    variant: {
      elevated: {
        root: {
          bg: "gray.surface.bg",
          boxShadow: "lg",
        },
      },
      outline: {
        root: {
          bg: "gray.surface.bg",
          borderWidth: "1px",
        },
      },
      subtle: {
        root: {
          bg: "gray.subtle.bg",
        },
      },
    },
    direction: {
      horizontal: {
        root: {
          flexDirection: "row",
        },
      },
      vertical: {
        root: {
          flexDirection: "column",
        },
      },
    },
  },
});
