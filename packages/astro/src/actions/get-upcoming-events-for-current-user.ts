import { defineAction } from "astro:actions";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    const signups = await context.locals.payload.find({
      collection: "signups",
      depth: 1,

      where: {
        user: { equals: context.locals.user.id },
        "event.start_date": { greater_than_equal: Date.now() },
      },

      pagination: false,
    });

    return signups.docs.map((s) => s.event);
  },
});
