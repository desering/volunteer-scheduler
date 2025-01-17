import { defineAction } from "astro:actions";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    return await context.locals.payload.find({
      collection: "signups",
      depth: 3,

      where: {
        user: { equals: context.locals.user.id },
        // start_date only exists on events, not on signups
      //   start_date: { greater_than_equal: Date.now() },
      },

      // joins: {
      // //   events: true,
      // },

      pagination: false,
    });
  },
});
