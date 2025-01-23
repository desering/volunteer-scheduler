import type { Event } from "@payload-types";
import { defineAction } from "astro:actions";
import { startOfDay } from "date-fns";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    if (!context.locals.user) {
      return [];
    }

    const signups = await context.locals.payload.find({
      collection: "signups",
      depth: 1,

      where: {
        user: { equals: context.locals.user.id },
        "event.start_date": { greater_than_equal: startOfDay(Date.now()) },
      },

      pagination: false,
    });

    return signups.docs.map((s) => s.event as Event);
  },
});
