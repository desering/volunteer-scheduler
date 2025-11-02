import type { Event } from "@payload-types";

export type EventsGroupedByDay = Record<string, Event[]>;

export const groupEventsByDate = (events: Event[]): EventsGroupedByDay =>
  events.reduce((acc, event) => {
    if (!acc[event.start_date]) {
      acc[event.start_date] = [];
    }
    acc[event.start_date].push(event);
    return acc;
  }, {} as EventsGroupedByDay);
