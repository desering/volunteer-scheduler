"use client";
import type { Assign } from "@ark-ui/react";
import { Field } from "@ark-ui/react/field";
import { panda } from "styled-system/jsx";
import {
  type FieldVariantProps,
  field,
  input,
  textarea,
} from "styled-system/recipes";
import type { ComponentProps, HTMLPandaProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

const { withProvider, withContext } = createStyleContext(field);

export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withProvider<
  HTMLDivElement,
  Assign<
    Assign<HTMLPandaProps<"div">, Field.RootProviderBaseProps>,
    FieldVariantProps
  >
>(Field.RootProvider, "root");

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider<
  HTMLDivElement,
  Assign<Assign<HTMLPandaProps<"div">, Field.RootBaseProps>, FieldVariantProps>
>(Field.Root, "root");

export const ErrorText = withContext<
  HTMLSpanElement,
  Assign<HTMLPandaProps<"span">, Field.ErrorTextBaseProps>
>(Field.ErrorText, "errorText");

export const HelperText = withContext<
  HTMLSpanElement,
  Assign<HTMLPandaProps<"span">, Field.HelperTextBaseProps>
>(Field.HelperText, "helperText");

export const Label = withContext<
  HTMLLabelElement,
  Assign<HTMLPandaProps<"label">, Field.LabelBaseProps>
>(Field.Label, "label");

export const Select = withContext<
  HTMLSelectElement,
  Assign<HTMLPandaProps<"select">, Field.SelectBaseProps>
>(Field.Select, "select");

export type InputProps = ComponentProps<typeof Input>;
export const Input = panda(Field.Input, input);

export type TextareaProps = ComponentProps<typeof Textarea>;
export const Textarea = panda(Field.Textarea, textarea);

export { FieldContext as Context } from "@ark-ui/react/field";
