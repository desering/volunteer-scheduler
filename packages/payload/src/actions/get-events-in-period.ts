"use server";

import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({
  config,
});

export const getEventsInPeriod = async (start: Date, end: Date) => {
  const events = await payload.find({
    collection: "events",
    where: {
      start_date: {
        greater_than_equal: start,
      },
      end_date: {
        less_than_equal: end,
      },
    },
    sort: "start_date",
    pagination: false,
  });
  return events;
};
