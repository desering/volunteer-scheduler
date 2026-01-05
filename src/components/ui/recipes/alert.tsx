import { defineSlotRecipe } from "@pandacss/dev";

export const alert = defineSlotRecipe({
  className: "alert",
  slots: ["root", "content", "description", "indicator", "title"],
  base: {
    root: {
      alignItems: "flex-start",
      borderRadius: "l3",
      display: "flex",
      position: "relative",
      width: "full",
      borderWidth: "0",
    },
    content: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
      gap: "1",
    },
    description: {
      display: "inline",
      color: "colorPalette.text",
    },
    indicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      color: "colorPalette.text",
    },
    title: {
      fontWeight: "semibold",
      color: "colorPalette.text",
    },
  },
  defaultVariants: {
    size: "md",
    status: "info",
    variant: "subtle",
  },
  variants: {
    size: {
      md: {
        root: {
          gap: "3",
          p: "4",
          textStyle: "sm",
        },
        indicator: {
          _icon: {
            width: "5",
            height: "5",
          },
        },
      },
      lg: {
        root: {
          gap: "4",
          p: "4",
          textStyle: "md",
        },
        indicator: {
          _icon: {
            width: "6",
            height: "6",
          },
        },
      },
    },
    variant: {
      solid: {
        root: {
          bg: "colorPalette.default",
          color: "white",
        },
      },
      surface: {
        root: {
          bg: "colorPalette.a3",
          borderWidth: "1px",
          borderColor: "colorPalette.a6",
          color: "colorPalette.text",
        },
      },
      subtle: {
        root: {
          bg: "colorPalette.a3",
          color: "colorPalette.text",
        },
      },
      outline: {
        root: {
          borderWidth: "1px",
          borderColor: "colorPalette.a6",
          color: "colorPalette.text",
        },
      },
    },
    status: {
      info: {
        root: { colorPalette: "blue" },
      },
      warning: {
        root: { colorPalette: "orange" },
      },
      success: {
        root: { colorPalette: "green" },
      },
      error: {
        root: { colorPalette: "red" },
      },
      neutral: {
        root: { colorPalette: "gray" },
      },
    },
  },
});
