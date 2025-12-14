import { toastAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const toast = defineSlotRecipe({
  className: "toast",
  slots: toastAnatomy.keys(),
  jsx: ["Toaster"],
  base: {
    root: {
      alignItems: "start",
      // background: "gray.surface.bg", new var
      background: { base: "bg.canvas", _dark: "bg.emphasized" },
      borderRadius: "l3",
      boxShadow: "lg",
      display: "flex",
      gap: "4",
      height: "var(--height)",
      minWidth: "sm",
      opacity: "var(--opacity)",
      overflowWrap: "anywhere",
      p: "4",
      position: "relative",
      scale: "var(--scale)",
      transitionDuration: "slow",
      transitionProperty: "translate, scale, opacity, height",
      transitionTimingFunction: "default",
      translate: "var(--x) var(--y)",
      // width: "full",
      willChange: "translate, opacity, scale",
      zIndex: "var(--z-index)",
    },
    title: {
      color: "fg.default",
      fontWeight: "medium",
      textStyle: "sm",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
    actionTrigger: {
      // color: "colorPalette.plain.fg", new var
      color: "colorPalette.canvas",
      cursor: "pointer",
      fontWeight: "semibold",
      textStyle: "sm",
    },
    closeTrigger: {
      position: "absolute",
      top: "2",
      insetEnd: "2",
    },
  },
});
