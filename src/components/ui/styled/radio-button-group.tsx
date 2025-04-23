import { type Assign, RadioGroup } from "@ark-ui/react";
import {
  type RadioButtonGroupVariantProps,
  radioButtonGroup,
} from "styled-system/recipes";
import type { ComponentProps, HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

const { withProvider, withContext } = createStyleContext(radioButtonGroup);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider<
  HTMLDivElement,
  Assign<
    Assign<HTMLPandaProps<"div">, RadioGroup.RootProps>,
    RadioButtonGroupVariantProps
  >
>(RadioGroup.Root, "root");

export const Indicator = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, RadioGroup.IndicatorProps>
>(RadioGroup.Indicator, "indicator");

export const ItemControl = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, RadioGroup.ItemControlProps>
>(RadioGroup.ItemControl, "itemControl");

export const Item = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"label">, RadioGroup.ItemProps>
>(RadioGroup.Item, "item");

export const ItemText = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"span">, RadioGroup.ItemTextProps>
>(RadioGroup.ItemText, "itemText");

export const Label = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"label">, RadioGroup.LabelProps>
>(RadioGroup.Label, "label");

export {
  RadioGroupContext as Context,
  RadioGroupItemHiddenInput as ItemHiddenInput,
} from "@ark-ui/react";
