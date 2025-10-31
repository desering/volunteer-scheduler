import type { Event } from "@payload-types";

export type DisplayableEvent = {
  doc: Event;
  start_date: Date;
  end_date: Date;
};
export type GroupedEventsByDay = Record<string, DisplayableEvent[]>;

export const groupAndSortEventsByDate = async (
  events: Event[],
): Promise<GroupedEventsByDay> => {
  const displayableEvents = await Promise.all(
    events.map(async (doc) => await eventToDisplayableEvent(doc)),
  );

  const displayableEventsGroupedByDay = displayableEvents.reduce(
    (acc, event) => {
      const date = event.start_date.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    },
    {} as Record<string, typeof displayableEvents>,
  );

  return displayableEventsGroupedByDay;
};

export const eventToDisplayableEvent = async (
  event: Event,
): Promise<DisplayableEvent> => ({
  doc: event,
  start_date: new Date(event.start_date),
  end_date: new Date(event.end_date),
});
