"use client";
import { Checkbox, useCheckboxContext } from "@ark-ui/react/checkbox";
import { type ComponentProps, forwardRef } from "react";
import { createStyleContext, panda } from "styled-system/jsx";
import { checkbox } from "styled-system/recipes";
import type { HTMLPandaProps } from "styled-system/types";

const { withProvider, withContext } = createStyleContext(checkbox);

export type RootProps = ComponentProps<typeof Root>;
export type HiddenInputProps = ComponentProps<typeof HiddenInput>;

export const Root = withProvider(Checkbox.Root, "root");
export const RootProvider = withProvider(Checkbox.RootProvider, "root");
export const Control = withContext(Checkbox.Control, "control");
export const Group = withProvider(Checkbox.Group, "group");
export const Label = withContext(Checkbox.Label, "label");
export const HiddenInput = Checkbox.HiddenInput;

export {
  type CheckboxCheckedState as CheckedState,
  CheckboxGroupProvider as GroupProvider,
} from "@ark-ui/react/checkbox";

export const Indicator = forwardRef<SVGSVGElement, HTMLPandaProps<"svg">>(
  function Indicator(props, ref) {
    const { indeterminate, checked } = useCheckboxContext();

    return (
      <Checkbox.Indicator indeterminate={indeterminate} asChild>
        <panda.svg
          ref={ref}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3px"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <title>Checkmark</title>
          {indeterminate ? (
            <path d="M5 12h14" />
          ) : checked ? (
            <path d="M20 6 9 17l-5-5" />
          ) : null}
        </panda.svg>
      </Checkbox.Indicator>
    );
  },
);
