import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events";
import { z } from "astro:schema";

import type { Where } from "payload";

export const getEventsByUser = defineAction({
  input: z.object({
    id: z.number(),
  }),
  handler: async (input, context) => {
    const events = await context.locals.payload.find({
      collection: "signups",
      depth: 1,

      where: {
        user_id: { equals: input.id },
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
