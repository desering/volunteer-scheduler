"use server";

import { css } from "styled-system/css";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { EventOverview } from "@/components/event-overview";
import { getActiveAnnouncement } from "@/lib/services/get-active-announcement";

export default async function Page() {
  const announcement = await getActiveAnnouncement();

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
