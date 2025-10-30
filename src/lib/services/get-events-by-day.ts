"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { groupAndSortEventsByDate } from "@/lib/mappers/map-events";

export const getEventsByDay = async () => {
  const payload = await getPayload({ config });

  const events = await payload.find({
    collection: "events",

    joins: {
      roles: false,
      sections: false,
      signups: {
        limit: 100,
      },
    },

    pagination: false,
  });

  return await groupAndSortEventsByDate(events.docs);
};
