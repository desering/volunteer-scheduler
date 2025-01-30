import type { Event } from "@payload-types";
import { defineAction } from "astro:actions";
import { startOfDay } from "date-fns";
import { error } from "node:console";
import { prepareEvent } from "~/utils/map-events";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    if (!context.locals.user) {
      throw error("Not authenticated");
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

    return Promise.all(
      signups.docs
        .map((s) => s.event as Event)
        .sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
        )
        .map((event) => prepareEvent(event)),
    );
  },
});
