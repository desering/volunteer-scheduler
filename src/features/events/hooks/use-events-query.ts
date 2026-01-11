import { utc } from "@date-fns/utc";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import {
  type EventsGroupedByDay,
  groupEventsByDate,
} from "@/lib/mappers/group-events-by-date";
import type { Event } from "@/payload-types";

export const eventsQueryConfig = (initialEvents?: EventsGroupedByDay) =>
  queryOptions<EventsGroupedByDay>({
    queryKey: ["eventsByDay"],
    queryFn: async () => {
      const url = "/api/events?";
      const searchParams = new URLSearchParams({
        min_date: startOfDay(new Date(), { in: utc }).toISOString(),
      });

      const res = await fetch(url + searchParams);
      const events = (await res.json()) as unknown as Event[];

      return groupEventsByDate(events);
    },
    placeholderData: initialEvents,
  });

export const useEventsQuery = (initialEvents?: EventsGroupedByDay) =>
  useQuery<EventsGroupedByDay>(eventsQueryConfig(initialEvents));
