import { utc } from "@date-fns/utc";
import { startOfMonth } from "date-fns";

export const startOfMonthUTC = (day: Date) => startOfMonth(day, { in: utc });
