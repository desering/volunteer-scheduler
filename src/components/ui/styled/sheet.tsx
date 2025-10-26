import type { Assign, PolymorphicProps } from "@ark-ui/react";
import { Dialog } from "@ark-ui/react/dialog";
import { ark } from "@ark-ui/react/factory";
import { type SheetVariantProps, sheet } from "styled-system/recipes";
import type { ComponentProps, HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

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
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Dialog.BackdropProps>
>(Dialog.Backdrop, "backdrop");

export type CloseTriggerProps = ComponentProps<typeof CloseTrigger>;
export const CloseTrigger = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"button">, Dialog.CloseTriggerProps>
>(Dialog.CloseTrigger, "closeTrigger");

export type ContentProps = ComponentProps<typeof Content>;
export const Content = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Dialog.ContentProps>
>(Dialog.Content, "content");

export type DescriptionProps = ComponentProps<typeof Description>;
export const Description = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Dialog.DescriptionProps>
>(Dialog.Description, "description");

export type PositionerProps = ComponentProps<typeof Positioner>;
export const Positioner = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, Dialog.PositionerProps>
>(Dialog.Positioner, "positioner");

export type TitleProps = ComponentProps<typeof Title>;
export const Title = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"h2">, Dialog.TitleProps>
>(Dialog.Title, "title");

export type TriggerProps = ComponentProps<typeof Trigger>;
export const Trigger = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"button">, Dialog.TriggerProps>
>(Dialog.Trigger, "trigger");

export const Header = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "header");

export const Body = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "body");

export const Footer = withContext<
  HTMLDivElement,
  Assign<HTMLPandaProps<"div">, PolymorphicProps>
>(ark.div, "footer");

export type { DialogContextProps as ContextProps } from "@ark-ui/react";
export { DialogContext as Context } from "@ark-ui/react/dialog";
