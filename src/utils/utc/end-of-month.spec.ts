import { expect, test } from "bun:test";
import { endOfMonthUTC } from "./end-of-month";

test("end of month", () => {
  [
    {
      input: new Date("July 17, 2025, 13:24:00"),
      expect: new Date("July 31, 2025, 23:59:59.999Z"),
    },
  ].forEach((c) => {
    expect(endOfMonthUTC(c.input)).toEqual(c.expect);
  });
});
