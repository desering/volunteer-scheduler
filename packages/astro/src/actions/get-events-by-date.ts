import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events.ts";
import { z } from "astro:schema";

export const getEventsByDate = defineAction({
  input: z.object({
    date: z.date(),
  }),
  handler: async (input, context) => {
    const events = await context.locals.payload.find({
      collection: "events",

      where: {
        start_date: {
          greater_than_equal: input.date,
        },
        end_date: {
          less_than_equal: input.date,
        },
      },

      joins: {
        roles: false,
        sections: false,
      },

      pagination: false,
    });

    return await groupAndSortEventsByDate(events.docs);
  },
});
