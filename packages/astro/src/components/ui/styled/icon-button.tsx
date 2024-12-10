import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { panda } from "styled-system/jsx";
import { type ButtonVariantProps, button } from "styled-system/recipes/button";

export type IconButtonProps = ComponentProps<typeof IconButton>;
export const IconButton = panda(ark.button, button, {
	defaultProps: { px: "0" } as ButtonVariantProps,
});
