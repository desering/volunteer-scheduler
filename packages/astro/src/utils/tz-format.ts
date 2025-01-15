import { type DateArg, type FormatOptions, format as dfFormat } from "date-fns";
import { tz } from "@date-fns/tz";

export const format = (
  date: DateArg<Date> & {},
  formatStr: string,
  options?: FormatOptions,
): string => {
  return dfFormat(date, formatStr, {
    ...options,
    weekStartsOn: 1,
    in: tz("Europe/Amsterdam"),
  });
};
