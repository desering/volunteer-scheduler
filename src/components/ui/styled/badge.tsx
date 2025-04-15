import { ark } from "@ark-ui/react";
import type { ComponentProps } from "styled-system/types";
import { panda } from "styled-system/jsx";
import { badge } from "styled-system/recipes";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = panda(ark.div, badge);
