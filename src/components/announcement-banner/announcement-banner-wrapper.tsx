"use client";

import { type ReactNode, useState } from "react";
import { Alert, CloseButton } from "@/components/ui";

type AnnouncementBannerWrapperProps = {
  children: ReactNode;
};

export const AnnouncementBannerWrapper = ({
  children,
}: AnnouncementBannerWrapperProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <Alert.Root status="error" variant="subtle">
      <Alert.Indicator />
      <Alert.Content>{children}</Alert.Content>
      <CloseButton
        pos="relative"
        top="-2"
        insetEnd="-2"
        size="sm"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss announcement"
      />
    </Alert.Root>
  );
};
