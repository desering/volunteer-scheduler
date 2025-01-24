import type { Event } from "../../../shared/payload-types";
import { convertLexicalToHTML } from "./convert-lexical-to-html";

export type DisplayableEvent = {
  doc: Event;
  descriptionHtml?: string;
  start_date: Date;
  end_date: Date;
};
export type EventsByDay = Record<string, DisplayableEvent[]>;

export const groupAndSortEventsByDate = async (
  events: Event[],
): Promise<EventsByDay> => {
  // https://payloadcms.com/docs/lexical/converters#generating-html-anywhere-on-the-server

  const mappedEvents = await Promise.all(
    events.map(async (doc) => await prepareEvent(doc)),
  );

  console.log(mappedEvents);

  const sorted = mappedEvents.sort(
    (a, b) => a.start_date.getTime() - b.start_date.getTime(),
  );

  const groupedByDay = sorted.reduce(
    (acc, event) => {
      const date = event.start_date.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    },
    {} as Record<string, typeof mappedEvents>,
  );

  return groupedByDay;
};

export const prepareEvent = async (
  event: Event,
): Promise<DisplayableEvent> => ({
  doc: event,
  descriptionHtml: event.description
    ? await convertLexicalToHTML(event.description)
    : undefined,
  start_date: new Date(event.start_date),
  end_date: new Date(event.end_date),
});
