import { ark } from "@ark-ui/react/factory";
import { panda } from "styled-system/jsx";
import { type ButtonVariantProps, button } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

export type IconButtonProps = ComponentProps<typeof IconButton>;
export const IconButton = panda(ark.button, button, {
  defaultProps: { px: "0" } as ButtonVariantProps,
});
