import { utc } from "@date-fns/utc";
import { lastDayOfMonth } from "date-fns";

export const lastDayOfMonthUTC = (day: Date) =>
  lastDayOfMonth(day, { in: utc });
