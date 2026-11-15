import { expect, test } from "bun:test";
import { UTCDate } from "@date-fns/utc";
import { lastDayOfMonthUTC } from "./last-day-of-month";

test("last day of month", () => {
  [
    {
      input: new Date("July 17, 2025, 13:24:00"),
      expect: new UTCDate("July 31, 2025, 00:00:00.000Z"),
    },
  ].forEach((c) => {
    expect(lastDayOfMonthUTC(c.input)).toEqual(c.expect);
  });
});
