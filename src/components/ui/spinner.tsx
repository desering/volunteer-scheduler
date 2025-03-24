import { forwardRef } from "react";
import { panda } from "styled-system/jsx";
import {
  Spinner as PandaSpinner,
  type SpinnerProps as PandaSpinnerProps,
} from "./styled/spinner";

export interface SpinnerProps extends PandaSpinnerProps {
  /**
   * For accessibility, it is important to add a fallback loading text.
   * This text will be visible to screen readers.
   * @default "Loading..."
   */
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (props, ref) => {
    const { label = "Loading...", ...rest } = props;

    return (
      <PandaSpinner
        ref={ref}
        borderBottomColor="transparent"
        borderLeftColor="transparent"
        {...rest}
      >
        {label && <panda.span srOnly>{label}</panda.span>}
      </PandaSpinner>
    );
  },
);

Spinner.displayName = "Spinner";
