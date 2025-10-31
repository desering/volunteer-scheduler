"use server";

import { UTCDate } from "@date-fns/utc";
import config from "@payload-config";
import { endOfDay, startOfDay } from "date-fns";
import { getPayload, type Where } from "payload";
import { groupAndSortEventsByDate } from "@/lib/mappers/map-events";

/**
 * getEventsByDay either returns all events grouped by day (deprecated), or if
 * given a date parameter, it returns all events that are on that day.
 * This function operates in UTC, because the data stored in the database is in
 * UTC too. Time zone conversion is responsibility of the caller.
 * @param date
 */
export const getEventsByDay = async (date: UTCDate | undefined) => {
  const payload = await getPayload({ config });

  const where: Where = date
    ? {
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
      }
    : {};

  const events = await payload.find({
    collection: "events",

    where: where,

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
