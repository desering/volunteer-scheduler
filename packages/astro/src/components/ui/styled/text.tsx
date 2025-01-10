import type { ComponentProps, JSX } from "solid-js";
import { panda } from "styled-system/jsx";
import { type TextVariantProps, text } from "styled-system/recipes";
import type { PandaComponent } from "styled-system/types";

type ParagraphProps = TextVariantProps & { as?: JSX.Element };

export type TextProps = ComponentProps<typeof Text>;
export const Text = panda("p", text) as PandaComponent<"p", ParagraphProps>;
