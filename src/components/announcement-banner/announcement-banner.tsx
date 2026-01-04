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
  if (!announcement) {
    return null;
  }

  return (
    <Container width="100%" marginTop="4">
      <AnnouncementBannerWrapper>
        <AnnouncementBannerContent announcement={announcement} />
      </AnnouncementBannerWrapper>
    </Container>
  );
};
