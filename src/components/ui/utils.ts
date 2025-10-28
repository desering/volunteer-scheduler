import { css } from "styled-system/css";

export const gutterX = css({
  paddingX: { base: "16px", md: "40px", lg: "60px" },
});

export const bleedX = css({
  marginX: { base: "-16px", md: "-40px", lg: "-60px" },
});

export const gutterY = css({ paddingTop: "30px", paddingBottom: "60px" });

export const divider = css({
  borderBottom: "1px solid",
  borderBottomColor: "border.muted",
});
