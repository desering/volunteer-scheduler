"use client";

import { Switch as PandaSwitch } from "@ark-ui/react/switch";
import { forwardRef } from "react";
import { createStyleContext } from "styled-system/jsx";
import { switchRecipe } from "styled-system/recipes";
import type { ComponentProps } from "styled-system/types";

const { withRootProvider, withContext } = createStyleContext(switchRecipe);

export const Root = withRootProvider(PandaSwitch.Root);
export const Control = withContext(PandaSwitch.Control, "control");
export const HiddenInput = PandaSwitch.HiddenInput;
export const Label = withContext(PandaSwitch.Label, "label");
export const Thumb = withContext(PandaSwitch.Thumb, "thumb");

export const Switch = forwardRef<HTMLInputElement, ComponentProps<typeof Root>>(
  (props, ref) => {
    const { label, ...rest } = props;

    return (
      <Root {...rest}>
        <Control>
          <Thumb />
        </Control>
        {label && <Label>{label}</Label>}
        <HiddenInput ref={ref} />
      </Root>
    );
  },
);
