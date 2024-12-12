import type { Shift } from "../../../shared/payload-types";
import {
  consolidateHTMLConverters,
  convertLexicalToHTML,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import { getPayloadInstance } from "./global-payload";

export const groupAndSortShiftsByDate = async (
  shifts: Shift[],
): Promise<ShiftsByDay> => {
  // https://payloadcms.com/docs/lexical/converters#generating-html-anywhere-on-the-server
  const editorConfig = defaultEditorConfig;
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})];
  const sanitizedEditorConfig = await sanitizeServerEditorConfig(
    editorConfig,
    (await getPayloadInstance()).config,
  );

  const mappedShifts = await Promise.all(
    shifts.map(async (doc) => {
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
      } satisfies RenderedShift;
    }),
  );

  const sorted = mappedShifts.sort(
    (a, b) => a.start_date.getTime() - b.start_date.getTime(),
  );

  const groupedByDay = sorted.reduce(
    (acc, shift) => {
      const date = shift.start_date.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    },
    {} as Record<string, typeof mappedShifts>,
  );

  return groupedByDay;
};

export type RenderedShift = {
  doc: Shift;
  descriptionHtml?: string;
  start_date: Date;
  end_date: Date;
};
export type ShiftsByDay = Record<string, RenderedShift[]>;
