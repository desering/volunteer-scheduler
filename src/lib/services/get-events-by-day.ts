"use server";

import { groupAndSortEventsByDate } from "@/lib/mappers/map-events";
import { getPayload } from "payload";
import config from "@payload-config";

export const getEventsByDay = async () => {
  const payload = await getPayload({ config });

  const events = await payload.find({
    collection: "events",

    joins: {
      roles: false,
      sections: false,
    },

    pagination: false,
  });

  return await groupAndSortEventsByDate(events.docs);
};
