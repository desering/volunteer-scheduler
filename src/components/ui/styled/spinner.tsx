import { ark } from "@ark-ui/react/factory";
import { panda } from "styled-system/jsx";
import { spinner } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

export type SpinnerProps = ComponentProps<typeof Spinner>;
export const Spinner = panda(ark.div, spinner);
