"use server";

import { UTCDate } from "@date-fns/utc";
import config from "@payload-config";
import { endOfDay, startOfDay } from "date-fns";
import { getPayload } from "payload";
import { eventToDisplayableEvent } from "@/lib/mappers/map-events";

/**
 * getEventsByDay returns all events that are on the day of the given date
 * parameter. This function operates in UTC, because the data stored in the
 * database is in UTC too. Time zone conversion is responsibility of the caller.
 * @param date
 */
export const getEventsByDay = async (date: UTCDate) => {
  const payload = await getPayload({ config });

  const events = await payload.find({
    collection: "events",

    where: {
      and: [
        {
          start_date: {
            greater_than_equal: startOfDay(date),
          },
        },
        {
          start_date: {
            less_than_equal: endOfDay(date),
          },
        },
      ],
    },

    joins: {
      roles: false,
      sections: false,
      signups: {
        limit: 100,
      },
    },

    sort: "start_date",

    pagination: false,
  });

  // Convert Events to DisplayableEvents
  return await Promise.all(
    events.docs.map(async (doc) => await eventToDisplayableEvent(doc)),
  );
};
