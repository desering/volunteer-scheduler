import { tz } from "@date-fns/tz";
import { type DateArg, format as dfFormat, type FormatOptions } from "date-fns";

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
