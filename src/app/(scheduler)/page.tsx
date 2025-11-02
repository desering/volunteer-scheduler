"use server";

import { css } from "styled-system/css";
import { EventOverview } from "@/components/event-overview";

export default async function Page() {
  return (
    <EventOverview
      className={css({
        flex: "1",
        marginTop: "4",
      })}
    />
  );
}
