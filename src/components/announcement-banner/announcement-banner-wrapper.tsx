"use client";

import { type ReactNode, useState } from "react";
import { Alert, CloseButton } from "@/components/ui";

type AlertStatus = "neutral" | "info" | "warning" | "error" | "success";

type AnnouncementBannerWrapperProps = {
  children: ReactNode;
  status?: AlertStatus;
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
}: AnnouncementBannerWrapperProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const colorPalette = statusToColorPalette[status];

  return (
    <Alert.Root status={status} variant="subtle">
      <Alert.Indicator />
      <Alert.Content>{children}</Alert.Content>
      <CloseButton
        pos="relative"
        top="-2"
        insetEnd="-2"
        colorPalette={colorPalette}
        size="sm"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss announcement"
      />
    </Alert.Root>
  );
};
