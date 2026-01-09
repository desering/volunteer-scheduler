import { css } from "styled-system/css";
import { EventOverview } from "@/components/event-overview";

export const dynamic = "force-dynamic";

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
