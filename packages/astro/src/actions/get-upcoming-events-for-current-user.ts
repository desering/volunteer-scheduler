import type { Event } from "@payload-types";
import { ActionError, defineAction } from "astro:actions";
import { startOfDay } from "date-fns";
import { prepareEvent } from "~/utils/map-events";

export const getUpcomingEventsForCurrentUser = defineAction({
  handler: async (_, context) => {
    if (!context.locals.user)
      throw new ActionError({
        code: "UNAUTHORIZED",
      });

    const signups = await context.locals.payload.find({
      collection: "signups",
      depth: 1,
      where: {
        user: { equals: context.locals.user.id },
        "event.start_date": { greater_than_equal: startOfDay(Date.now()) },
      },
      sort: "event.start_date",
      pagination: false,
    });

    return {
      signups,
      events: await Promise.all(
        signups.docs.map((s) => prepareEvent(s.event as Event)),
      ),
    };
  },
});
