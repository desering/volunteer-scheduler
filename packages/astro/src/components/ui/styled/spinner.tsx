import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import { panda } from "styled-system/jsx";
import { spinner } from "styled-system/recipes/spinner";

export type SpinnerProps = ComponentProps<typeof Spinner>;
export const Spinner = panda(ark.div, spinner);
