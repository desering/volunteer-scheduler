import type { Event } from "../../../shared/payload-types";
import {
  consolidateHTMLConverters,
  convertLexicalToHTML,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import { getPayloadInstance } from "./global-payload";

export const groupAndSortEventsByDate = async (
  events: Event[],
): Promise<EventsByDay> => {
  // https://payloadcms.com/docs/lexical/converters#generating-html-anywhere-on-the-server
  const editorConfig = defaultEditorConfig;
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})];
  const sanitizedEditorConfig = await sanitizeServerEditorConfig(
    editorConfig,
    (await getPayloadInstance()).config,
  );

  const mappedEvents = await Promise.all(
    events.map(async (doc) => {
      let descriptionHtml: string | undefined = undefined;
      if (doc.description) {
        descriptionHtml = await convertLexicalToHTML({
          converters: consolidateHTMLConverters({
            editorConfig: sanitizedEditorConfig,
          }),
          data: doc.description,
        });
      }

      return {
        doc,
        descriptionHtml,
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
