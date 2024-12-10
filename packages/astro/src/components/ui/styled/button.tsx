import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { panda } from "styled-system/jsx";
import { button } from "styled-system/recipes/button";

export type ButtonProps = ComponentProps<typeof Button>;
export const Button = panda(ark.button, button);
