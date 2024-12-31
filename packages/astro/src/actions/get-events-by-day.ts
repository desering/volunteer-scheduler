import { defineAction } from "astro:actions";
import { groupAndSortEventsByDate } from "~/utils/map-events";

export const getEventsByDay = defineAction({
  handler: async (_, context) => {
    const events = await context.locals.payload.find({
      collection: "events",

      joins: {
        roles: false,
        sections: false,
      },

      pagination: false,
    });

    return await groupAndSortEventsByDate(events.docs);
  },
});
