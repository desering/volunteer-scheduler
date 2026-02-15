import { expect, test } from "bun:test";
import { startOfMonthUTC } from "./start-of-month";

test("start of of month", () => {
  [
    {
      input: new Date("July 17, 2025, 13:24:00"),
      expect: new Date("July 1, 2025, 00:00:00.000Z"),
    },
  ].forEach((c) => {
    expect(startOfMonthUTC(c.input)).toEqual(c.expect);
  });
});
