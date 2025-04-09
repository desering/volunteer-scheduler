import type { Assign, PolymorphicProps } from "@ark-ui/solid";
import { Dialog } from "@ark-ui/solid/dialog";
import { ark } from "@ark-ui/solid/factory";
import type { ComponentProps } from "solid-js";
import type { HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "@/components/ui/styled/utils/create-style-context";
import { sheet, type SheetVariantProps } from "styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(sheet);

export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withRootProvider<
  Assign<Dialog.RootProps, SheetVariantProps>
>(Dialog.RootProvider);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider<
  Assign<Dialog.RootProps, SheetVariantProps>
>(Dialog.Root);

export type BackdropProps = ComponentProps<typeof Backdrop>;
export const Backdrop = withContext<
  Assign<HTMLPandaProps<"div">, Dialog.BackdropProps>
>(Dialog.Backdrop, "backdrop");

export type CloseTriggerProps = ComponentProps<typeof CloseTrigger>;
export const CloseTrigger = withContext<
  Assign<HTMLPandaProps<"button">, Dialog.CloseTriggerProps>
>(Dialog.CloseTrigger, "closeTrigger");

export type ContentProps = ComponentProps<typeof Content>;
export const Content = withContext<
  Assign<HTMLPandaProps<"div">, Dialog.ContentProps>
>(Dialog.Content, "content");

export type DescriptionProps = ComponentProps<typeof Description>;
export const Description = withContext<
  Assign<HTMLPandaProps<"div">, Dialog.DescriptionProps>
>(Dialog.Description, "description");

export type PositionerProps = ComponentProps<typeof Positioner>;
export const Positioner = withContext<
  Assign<HTMLPandaProps<"div">, Dialog.PositionerProps>
>(Dialog.Positioner, "positioner");

export type TitleProps = ComponentProps<typeof Title>;
export const Title = withContext<
  Assign<HTMLPandaProps<"h2">, Dialog.TitleProps>
>(Dialog.Title, "title");

export type TriggerProps = ComponentProps<typeof Trigger>;
export const Trigger = withContext<
  Assign<HTMLPandaProps<"button">, Dialog.TriggerProps>
>(Dialog.Trigger, "trigger");

export const Header = withContext<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "header");

export const Body = withContext<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "body");

export const Footer = withContext<
  Assign<HTMLPandaProps<"div">, PolymorphicProps<"div">>
>(ark.div, "footer");

export type { DialogContextProps as ContextProps } from "@ark-ui/solid";
export { DialogContext as Context } from "@ark-ui/solid/dialog";
