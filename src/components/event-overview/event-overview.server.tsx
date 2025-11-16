"use server";

import { utc } from "@date-fns/utc";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { groupEventsByDate } from "@/lib/mappers/group-events-by-date";
import { getEvents } from "@/lib/services/get-events";
import { EventOverviewClient } from "./event-overview.client";

type EventOverviewServerProps = {
  className?: string;
};

export const EventOverviewServer = async ({
  className,
}: EventOverviewServerProps) => {
  const events = await getEvents({
    minDate: startOfDay(new Date(), { in: utc }),
    maxDate: addDays(endOfDay(new Date(), { in: utc }), 1),
  });
  const eventsGroupedByDay = groupEventsByDate(events);

  return (
    <EventOverviewClient
      placeholder={eventsGroupedByDay}
      className={className}
    />
  );
};
