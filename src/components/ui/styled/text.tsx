import { panda } from "styled-system/jsx";
import { type TextVariantProps, text } from "styled-system/recipes";
import type { ComponentProps, PandaComponent } from "styled-system/types";

type ParagraphProps = TextVariantProps & { as?: React.ElementType };

export type TextProps = ComponentProps<typeof Text>;
export const Text = panda("p", text) as PandaComponent<"p", ParagraphProps>;
