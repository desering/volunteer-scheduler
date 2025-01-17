import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events";
import { z } from "astro:schema";

import type { Where } from "payload";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    const events = await context.locals.payload.find({
      collection: "signups",
      depth: 1,

      where: {
        user_id: { equals: context.locals.user.id },
      },

      joins: {
        events: true,
      },

      pagination: false,
    });

    return events;

    // return await groupAndSortEventsByDate(events.docs);
  },
});
