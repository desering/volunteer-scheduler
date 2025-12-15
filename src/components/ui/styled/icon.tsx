import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { panda } from "styled-system/jsx";
import { icon } from "styled-system/recipes";

export type IconProps = ComponentProps<typeof Icon>;
export const Icon = panda(ark.svg, icon, {
  defaultProps: { asChild: true },
});
