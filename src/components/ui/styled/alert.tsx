import { ark } from "@ark-ui/react";
import { createStyleContext } from "styled-system/jsx";
import { alert } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

const { withProvider, withContext } = createStyleContext(alert);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider(ark.div, "root");

export type ContentProps = ComponentProps<typeof Content>;
export const Content = withContext(ark.div, "content");

export type DescriptionProps = ComponentProps<typeof Description>;
export const Description = withContext(ark.div, "description");

export type IconProps = ComponentProps<typeof Icon>;
export const Icon = withContext(ark.svg, "icon");

export type TitleProps = ComponentProps<typeof Title>;
export const Title = withContext(ark.h5, "title");
