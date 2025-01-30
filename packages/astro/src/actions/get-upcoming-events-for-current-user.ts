import type { Event } from "@payload-types";
import { defineAction } from "astro:actions";
import { startOfDay } from "date-fns";
import { error } from "node:console";
import { type DisplayableEvent, prepareEvent } from "~/utils/map-events";

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

    return (
      await Promise.all(
        signups.docs
          .map((s) => s.event as Event)
          .map((event) => prepareEvent(event)),
      )
    ).sort(
      (a: DisplayableEvent, b: DisplayableEvent) =>
        a.start_date.getTime() - b.start_date.getTime(),
    );
  },
});
