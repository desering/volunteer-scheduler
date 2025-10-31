"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import {
  eventToDisplayableEvent,
  groupDisplayableEventsByDate,
} from "@/lib/mappers/map-events";

export const getEventsGroupedByDay = async () => {
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

    sort: "start_date",

    pagination: false,
  });

  // Convert Events to DisplayableEvents
  const displayableEvents = await Promise.all(
    events.docs.map(async (doc) => await eventToDisplayableEvent(doc)),
  );

  // Group DisplayableEvent by date
  return await groupDisplayableEventsByDate(displayableEvents);
};
