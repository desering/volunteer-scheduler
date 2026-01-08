"use server";

import { css } from "styled-system/css";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { EventOverview } from "@/components/event-overview";
import { getMostRecentAnnouncement } from "@/lib/services/get-most-recent-announcement";

export default async function Page() {
  const announcement = await getMostRecentAnnouncement();

  return (
    <>
      {announcement && <AnnouncementBanner announcement={announcement} />}
      <EventOverview
        className={css({
          flex: "1",
          marginTop: "4",
        })}
      />
    </>
  );
}
