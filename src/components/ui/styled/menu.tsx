"use client";
import type { Assign } from "@ark-ui/react";
import { Menu } from "@ark-ui/react/menu";
import { type MenuVariantProps, menu } from "styled-system/recipes";
import type { ComponentProps, HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

const { withRootProvider, withContext } = createStyleContext(menu);

export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withRootProvider<
  Assign<Menu.RootProviderProps, MenuVariantProps>
>(Menu.RootProvider);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider<Assign<Menu.RootProps, MenuVariantProps>>(
  Menu.Root,
);

export const Arrow = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ArrowBaseProps>
>(Menu.Arrow, "arrow");

export const ArrowTip = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ArrowTipBaseProps>
>(Menu.ArrowTip, "arrowTip");

export const CheckboxItem = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.CheckboxItemBaseProps>
>(Menu.CheckboxItem, "item");

export const Content = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ContentBaseProps>
>(Menu.Content, "content");

export const ContextTrigger = withContext<
  HTMLButtonElement,
  Assign<HTMLPandaProps<"button">, Menu.ContextTriggerBaseProps>
>(Menu.ContextTrigger, "contextTrigger");

export const Indicator = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.IndicatorBaseProps>
>(Menu.Indicator, "indicator");

export const ItemGroupLabel = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ItemGroupLabelBaseProps>
>(Menu.ItemGroupLabel, "itemGroupLabel");

export const ItemGroup = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ItemGroupBaseProps>
>(Menu.ItemGroup, "itemGroup");

export const ItemIndicator = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ItemIndicatorBaseProps>
>(Menu.ItemIndicator, "itemIndicator");

export const Item = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ItemBaseProps>
>(Menu.Item, "item");

export const ItemText = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.ItemTextBaseProps>
>(Menu.ItemText, "itemText");

export const Positioner = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.PositionerBaseProps>
>(Menu.Positioner, "positioner");

export const RadioItemGroup = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.RadioItemGroupBaseProps>
>(Menu.RadioItemGroup, "itemGroup");

export const RadioItem = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.RadioItemBaseProps>
>(Menu.RadioItem, "item");

export const Separator = withContext<
  HTMLHRElement,
  Assign<HTMLPandaProps<"hr">, Menu.SeparatorBaseProps>
>(Menu.Separator, "separator");

export const TriggerItem = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Menu.TriggerItemBaseProps>
>(Menu.TriggerItem, "triggerItem");

export const Trigger = withContext<
  HTMLButtonElement,
  Assign<HTMLPandaProps<"button">, Menu.TriggerBaseProps>
>(Menu.Trigger, "trigger");

export { MenuContext as Context } from "@ark-ui/react/menu";
