import { ark } from "@ark-ui/react";
import { panda } from "styled-system/jsx";
import { badge } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = panda(ark.div, badge);
