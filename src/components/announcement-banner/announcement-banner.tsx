"use client";

import { useState } from "react";
import { Container } from "styled-system/jsx";
import type { getActiveAnnouncement } from "@/lib/services/get-active-announcement";
import { AnnouncementBannerContent } from "./announcement-banner-content";
import { AnnouncementBannerWrapper } from "./announcement-banner-wrapper";

type AnnouncementBannerProps = {
  announcement: Awaited<ReturnType<typeof getActiveAnnouncement>>;
};

export const AnnouncementBanner = ({
  announcement,
}: AnnouncementBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcement || isDismissed) {
    return null;
  }

  return (
    <Container width="100%" marginTop="4">
      <AnnouncementBannerWrapper onDismiss={() => setIsDismissed(true)}>
        <AnnouncementBannerContent announcement={announcement} />
      </AnnouncementBannerWrapper>
    </Container>
  );
};
