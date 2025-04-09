import { type Assign, Menu } from "@ark-ui/react";
import { type MenuVariantProps, menu } from "styled-system/recipes";
import type { HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "@/components/ui/styled/utils/create-style-context";

const { withRootProvider, withContext } = createStyleContext(menu);

// export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withRootProvider<
  Assign<Menu.RootProviderProps, MenuVariantProps>
>(Menu.RootProvider);

// export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider<Assign<Menu.RootProps, MenuVariantProps>>(
  Menu.Root,
);

export const Arrow = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ArrowBaseProps>
>(Menu.Arrow, "arrow");

export const ArrowTip = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ArrowTipBaseProps>
>(Menu.ArrowTip, "arrowTip");

export const CheckboxItem = withContext<
  Assign<HTMLPandaProps<"div">, Menu.CheckboxItemBaseProps>
>(Menu.CheckboxItem, "item");

export const Content = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ContentBaseProps>
>(Menu.Content, "content");

export const ContextTrigger = withContext<
  Assign<HTMLPandaProps<"button">, Menu.ContextTriggerBaseProps>
>(Menu.ContextTrigger, "contextTrigger");

export const Indicator = withContext<
  Assign<HTMLPandaProps<"div">, Menu.IndicatorBaseProps>
>(Menu.Indicator, "indicator");

export const ItemGroupLabel = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ItemGroupLabelBaseProps>
>(Menu.ItemGroupLabel, "itemGroupLabel");

export const ItemGroup = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ItemGroupBaseProps>
>(Menu.ItemGroup, "itemGroup");

export const ItemIndicator = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ItemIndicatorBaseProps>
>(Menu.ItemIndicator, "itemIndicator");

export const Item = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ItemBaseProps>
>(Menu.Item, "item");

export const ItemText = withContext<
  Assign<HTMLPandaProps<"div">, Menu.ItemTextBaseProps>
>(Menu.ItemText, "itemText");

export const Positioner = withContext<
  Assign<HTMLPandaProps<"div">, Menu.PositionerBaseProps>
>(Menu.Positioner, "positioner");

export const RadioItemGroup = withContext<
  Assign<HTMLPandaProps<"div">, Menu.RadioItemGroupBaseProps>
>(Menu.RadioItemGroup, "itemGroup");

export const RadioItem = withContext<
  Assign<HTMLPandaProps<"div">, Menu.RadioItemBaseProps>
>(Menu.RadioItem, "item");

export const Separator = withContext<
  Assign<HTMLPandaProps<"hr">, Menu.SeparatorBaseProps>
>(Menu.Separator, "separator");

export const TriggerItem = withContext<
  Assign<HTMLPandaProps<"div">, Menu.TriggerItemBaseProps>
>(Menu.TriggerItem, "triggerItem");

export const Trigger = withContext<
  Assign<HTMLPandaProps<"button">, Menu.TriggerBaseProps>
>(Menu.Trigger, "trigger");

export { MenuContext as Context } from "@ark-ui/react";
