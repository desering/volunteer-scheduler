"use server";

import { getMostRecentAnnouncement } from "@/lib/services/get-most-recent-announcement";
import { AnnouncementBannerClient } from "./announcement-banner.client";

export const AnnouncementBannerServer = async () => {
  const announcement = await getMostRecentAnnouncement();

  if (!announcement) {
    return null;
  }

  return <AnnouncementBannerClient announcement={announcement} />;
};
