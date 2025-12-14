import { dialogAnatomy } from "@ark-ui/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

const anatomy = dialogAnatomy.extendWith("header", "body", "footer");

export const sheet = defineSlotRecipe({
  className: "sheet",
  slots: anatomy.keys(),
  base: {
    backdrop: {
      backdropFilter: "blur(4px)",
      background: {
        _light: "black.a7",
        _dark: "black.a7",
      },
      position: "fixed",
      left: "0",
      top: "0",
      height: "100vh",
      width: "100vw",
      zIndex: "overlay",
      _open: {
        animation: "backdrop-in",
      },
      _closed: {
        animation: "backdrop-out",
      },
    },
    positioner: {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      position: "fixed",
      width: { base: "100vw", md: "lg" },
      zIndex: "modal",
    },
    content: {
      overflow: "hidden",
      background: "bg.default",
      // boxShadow: "lg",
      display: "grid",
      gridTemplateColumns: "1fr",
      gridTemplateRows: "auto 1fr auto",
      gridTemplateAreas: `
        'header'
        'body'
        'footer'
      `,
      height: "full",
      width: "full",
      _hidden: {
        display: "none",
      },
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
      gridArea: "header",
      pt: { base: "4", md: "6" },
      pb: "4",
      px: { base: "4", md: "6" },
    },
    body: {
      display: "flex",
      flexDirection: "column",
      gridArea: "body",
      // overflow: "auto",
      p: { base: "4", md: "6" },
    },
    footer: {
      display: "flex",
      gridArea: "footer",
      justifyContent: "flex-end",
      py: "4",
      px: { base: "4", md: "6" },
    },
    title: {
      color: "fg.default",
      fontWeight: "semibold",
      textStyle: "xl",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
    closeTrigger: {
      position: "absolute",
      top: { base: "3", md: "4" },
      right: { base: "2", md: "4" },
    },
  },
  defaultVariants: {
    variant: "right",
  },
  variants: {
    variant: {
      left: {
        positioner: {
          top: "4",
          left: "4",
          bottom: "4",
        },
        content: {
          borderRadius: "2xl",

          _open: {
            animation: "drawer-in-left",
          },
          _closed: {
            animation: "drawer-out-left",
          },
        },
      },
      right: {
        positioner: {
          top: "4",
          right: "4",
          bottom: "4",
        },
        content: {
          borderRadius: "2xl",

          _open: {
            animation: "drawer-in-right",
          },
          _closed: {
            animation: "drawer-out-right",
          },
        },
      },
      bottom: {
        positioner: {
          bottom: 0,
          height: "auto",
        },
        content: {
          // borderRadius: "unset",
          borderTopRadius: "1.25rem",

          _open: {
            animation: "drawer-in-bottom",
          },
          _closed: {
            animation: "drawer-out-bottom",
          },
        },
      },
    },
  },
  jsx: ["Sheet", /Sheet\.+/],
});
