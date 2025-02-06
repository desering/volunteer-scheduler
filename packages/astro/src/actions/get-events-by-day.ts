import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events.ts";

export const getEventsByDate = defineAction({
  handler: async (_, context) => {
    const events = await context.locals.payload.find({
      collection: "events",

      where: {
        start_date: {
          greater_than_equal: new Date(),
        },
        end_date: {
          less_than_equal: new Date(),
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
