import { panda } from "styled-system/jsx";

export const LayoutFooter = () => (
  <panda.footer display="flex" justifyContent="center">
    <panda.p paddingBlock="10">
      Made with
      <panda.span
        aria-label="love"
        role="img"
        paddingInline="2"
        position="relative"
        insetBlockStart="2px"
      >
        &#129654;
      </panda.span>
      by volunteers at De Sering
    </panda.p>
  </panda.footer>
);
