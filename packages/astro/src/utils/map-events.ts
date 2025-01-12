import type { Event } from "../../../shared/payload-types";
import { convertLexicalToHTML } from "./convert-lexical-to-html";

export const groupAndSortEventsByDate = async (
  events: Event[],
): Promise<EventsByDay> => {
  // https://payloadcms.com/docs/lexical/converters#generating-html-anywhere-on-the-server

  const mappedEvents = await Promise.all(
    events.map(async (doc) => {
      return {
        doc,
        descriptionHtml: doc.description
          ? await convertLexicalToHTML(doc.description)
          : undefined,
        start_date: new Date(doc.start_date),
        end_date: new Date(doc.end_date),
      } satisfies RenderedEvent;
    }),
  );

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

export type RenderedEvent = {
  doc: Event;
  descriptionHtml?: string;
  start_date: Date;
  end_date: Date;
};
export type EventsByDay = Record<string, RenderedEvent[]>;
