import { ark } from "@ark-ui/solid";
import type { ComponentProps } from "solid-js";
import { panda } from "styled-system/jsx";
import { spinner } from "styled-system/recipes";

export type SpinnerProps = ComponentProps<typeof Spinner>;
export const Spinner = panda(ark.div, spinner);
