"use server";

import config from "@payload-config";
import { startOfDay } from "date-fns";
import { getPayload } from "payload";
import type { Event } from "@/payload-types";

export type EventsForUserId = Awaited<
  ReturnType<typeof getUpcomingEventsForUserId>
>;

export const getUpcomingEventsForUserId = async (
  userId: number,
  filterOptions?: {
    sort?: string[];
  },
) => {
  const payload = await getPayload({ config });

  const signups = await payload.find({
    collection: "signups",
    depth: 1,

    where: {
      user: { equals: userId },
      "event.start_date": { greater_than_equal: startOfDay(Date.now()) },
    },

    sort: filterOptions?.sort,
    pagination: false,
  });

  return {
    signups,
    events: signups.docs.map((s) => s.event as Event),
  };
};
