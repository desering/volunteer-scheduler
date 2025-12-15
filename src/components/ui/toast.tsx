import { Portal } from "@ark-ui/react";
import { createToaster, useToastContext } from "@ark-ui/react/toast";
import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from "lucide-react";
import { forwardRef } from "react";
import { Stack } from "styled-system/jsx";
import { Icon, type IconProps } from "./icon";
import { Spinner } from "./spinner";
import { CloseButton } from "./styled/close-button";
import * as Styled from "./styled/toast";

const iconMap: Record<string, React.ElementType> = {
  warning: CircleAlertIcon,
  success: CheckCircleIcon,
  error: CircleXIcon,
};

const Indicator = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const toast = useToastContext();

  const StatusIcon = iconMap[toast.type];
  if (!StatusIcon) return null;

  return (
    <Icon ref={ref} data-type={toast.type} {...props}>
      <StatusIcon />
    </Icon>
  );
});

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
  overlap: true,
  max: 5,
  duration: 6000,
});

export const Toaster = () => {
  return (
    <Portal>
      <Styled.Toaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Styled.Root>
            {toast.type === "loading" ? (
              <Spinner color="colorPalette.plain.fg" />
            ) : (
              <Indicator />
            )}

            <Stack gap="3" alignItems="start">
              <Stack gap="1">
                {toast.title && <Styled.Title>{toast.title}</Styled.Title>}
                {toast.description && (
                  <Styled.Description>{toast.description}</Styled.Description>
                )}
              </Stack>
              {toast.action && (
                <Styled.ActionTrigger>
                  {toast.action.label}
                </Styled.ActionTrigger>
              )}
            </Stack>
            {toast.closable && (
              <Styled.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Styled.CloseTrigger>
            )}
          </Styled.Root>
        )}
      </Styled.Toaster>
    </Portal>
  );
};
