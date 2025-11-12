import type { Event } from "@payload-types";

export type EventsGroupedByDay = Record<string, Event[]>;

export const groupEventsByDate = (events: Event[]): EventsGroupedByDay =>
  events.reduce((acc, event) => {
    const day = new Date(event.start_date).toDateString();

    if (!acc[day]) {
      acc[day] = [];
    }

    acc[day].push(event);

    return acc;
  }, {} as EventsGroupedByDay);
