import { type Assign, type PolymorphicProps, ark } from "@ark-ui/solid";
import type { ComponentProps } from "solid-js";
import { alert } from "styled-system/recipes";
import type { HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "@/components/ui/styled/utils/create-style-context";

const { withProvider, withContext } = createStyleContext(alert);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "root");

export const Content = withContext<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "content");

export const Description = withContext<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "description");

export const Icon = withContext<
  Assign<HTMLPandaProps<"svg">, PolymorphicProps<"svg">>
>(ark.svg, "icon");

export const Title = withContext<
  Assign<HTMLPandaProps<"h5">, PolymorphicProps<"h5">>
>(ark.h5, "title");
