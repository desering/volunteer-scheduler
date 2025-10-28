import { forwardRef } from "react";
import { Center, panda } from "styled-system/jsx";
import { Spinner } from "./spinner";
import * as Styled from "./styled/button";

interface ButtonLoadingProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
}

export interface ButtonProps extends Styled.ButtonProps, ButtonLoadingProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { loading, disabled, loadingText, children, ...rest } = props;

    const trulyDisabled = loading || disabled;

    return (
      <Styled.Button disabled={trulyDisabled} ref={ref} {...rest}>
        {loading && !loadingText ? (
          <>
            <ButtonSpinner />
            <panda.span opacity={0}>{children}</panda.span>
          </>
        ) : loadingText ? (
          loadingText
        ) : (
          children
        )}
      </Styled.Button>
    );
  },
);

Button.displayName = "Button";

const ButtonSpinner = () => (
  <Center
    inline
    position="absolute"
    transform="translate(-50%, -50%)"
    top="50%"
    insetStart="50%"
  >
    <Spinner
      width="1.1em"
      height="1.1em"
      borderWidth="1.5px"
      borderTopColor="fg.disabled"
      borderRightColor="fg.disabled"
    />
  </Center>
);
