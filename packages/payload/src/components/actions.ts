"use server";

import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });

export const getShiftsInPeriod = async (start: Date, end: Date) => {
  const shifts = await payload.find({
    collection: "shifts",
    where: {
      start_date: {
        greater_than_equal: start,
      },
      end_date: {
        less_than_equal: end,
      },
    },
  });
  return shifts;
};
