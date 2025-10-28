import NextLink from "next/link";
import { panda } from "styled-system/jsx";
import { link } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

export type LinkProps = ComponentProps<typeof Link>;
export const Link = panda(NextLink, link);
