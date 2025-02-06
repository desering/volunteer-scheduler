import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events.ts";

export const getAllEventsGroupedByDate = defineAction({
  handler: async (_, context) => {
    const allEvents = await context.locals.payload.find({
      collection: "events",

      joins: {
        roles: false,
        sections: false,
      },

      pagination: false,
    });

    return await groupAndSortEventsByDate(allEvents.docs);
  },
});
