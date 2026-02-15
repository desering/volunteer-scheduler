"use server";

import { utc } from "@date-fns/utc";
import { addMonths, endOfDay, startOfDay, subMonths } from "date-fns";
import { groupEventsByDate } from "@/lib/mappers/group-events-by-date";
import { getEvents } from "@/lib/services/get-events";
import { EventOverviewClient } from "./event-overview.client";

type EventOverviewServerProps = {
  className?: string;
};

export const EventOverviewServer = async ({
  className,
}: EventOverviewServerProps) => {
  const start = startOfDay(new Date()); // add some disabled buttons
  const earliestShownDate = subMonths(start, 1);
  const latestShownDate = addMonths(start, 1);
  const events = await getEvents({
    minDate: startOfDay(earliestShownDate, { in: utc }),
    maxDate: endOfDay(latestShownDate, { in: utc }),
  });
  const eventsGroupedByDay = groupEventsByDate(events);

  return (
    <EventOverviewClient
      placeholder={eventsGroupedByDay}
      className={className}
    />
  );
};
