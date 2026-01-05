"use client";

import { type ReactNode } from "react";
import * as Alert from "@/components/ui/styled/alert";
import { CloseButton } from "@/components/ui/styled/close-button";

type AlertStatus = "neutral" | "info" | "warning" | "error" | "success";

type AnnouncementBannerWrapperProps = {
  children: ReactNode;
  status?: AlertStatus;
  onDismiss: () => void;
};

const statusToColorPalette: Record<AlertStatus, string> = {
  neutral: "gray",
  info: "blue",
  warning: "orange",
  error: "red",
  success: "green",
};

export const AnnouncementBannerWrapper = ({
  children,
  status = "warning",
  onDismiss,
}: AnnouncementBannerWrapperProps) => {
  const colorPalette = statusToColorPalette[status];

  return (
    <Alert.Root status={status} variant="subtle">
      <Alert.Indicator />
      <Alert.Content>{children}</Alert.Content>
      <CloseButton
        pos="relative"
        top="1"
        insetEnd="1"
        colorPalette={colorPalette}
        size="sm"
        onClick={onDismiss}
        aria-label="Dismiss announcement"
      />
    </Alert.Root>
  );
};
