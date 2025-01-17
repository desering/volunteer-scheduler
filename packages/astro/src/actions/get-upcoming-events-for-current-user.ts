import { defineAction } from "astro:actions";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    const events = await context.locals.payload.find({
      collection: "signups",
      depth: 1,

      where: {
        user_id: { equals: context.locals.user.id },
        start_date: { greater_than_equal: Date.now() },
      },

      joins: {
        events: true,
      },

      pagination: false,
    });

    return events;
  },
});
