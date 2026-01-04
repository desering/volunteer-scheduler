"use client";

import { type ReactNode, useState } from "react";
import { HStack } from "styled-system/jsx";
import { Alert } from "@/components/ui/alert";
import { CloseButton } from "@/components/ui/styled/close-button";

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
    <Alert.Root status="info" variant="subtle">
      <Alert.Content>
        <HStack gap="2" alignItems="flex-start">
          <span style={{ fontSize: "1.5rem" }}>📌</span>
          {children}
          <CloseButton
            size="sm"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss announcement"
          />
        </HStack>
      </Alert.Content>
    </Alert.Root>
  );
};
