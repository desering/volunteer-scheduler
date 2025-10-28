import { utc } from "@date-fns/utc";
import { endOfMonth } from "date-fns";

export const endOfMonthUTC = (day: Date) => endOfMonth(day, { in: utc });
