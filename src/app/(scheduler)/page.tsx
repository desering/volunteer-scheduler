"use server";

import { css } from "styled-system/css";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { EventOverview } from "@/components/event-overview";

export default async function Page() {
  return (
    <>
      <AnnouncementBanner />
      <EventOverview
        className={css({
          flex: "1",
          marginTop: "4",
        })}
      />
    </>
  );
}
