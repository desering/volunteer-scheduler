import { type Assign, type PolymorphicProps, ark } from "@ark-ui/react";
import type { ComponentProps } from "styled-system/types";
import { alert } from "styled-system/recipes";
import type { HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

const { withProvider, withContext } = createStyleContext(alert);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "root");

export const Content = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "content");

export const Description = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "description");

export const Icon = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"svg">, PolymorphicProps>
>(ark.svg, "icon");

export const Title = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"h5">, PolymorphicProps>
>(ark.h5, "title");
