"use server";

import config from "@payload-config";
import type { Event } from "@payload-types";
import { startOfDay } from "date-fns";
import { getPayload } from "payload";
import { eventToDisplayableEvent } from "@/lib/mappers/map-events";

export type UpcomingEventsForUserId = Awaited<
  ReturnType<typeof getUpcomingEventsForUserId>
>;
export const getUpcomingEventsForUserId = async (userId: number) => {
  const payload = await getPayload({ config });

  const signups = await payload.find({
    collection: "signups",
    depth: 1,
    where: {
      user: { equals: userId },
      "event.start_date": { greater_than_equal: startOfDay(Date.now()) },
    },
    sort: "event.start_date",
    pagination: false,
  });

  return {
    signups,
    events: await Promise.all(
      signups.docs.map((s) => eventToDisplayableEvent(s.event as Event)),
    ),
  };
};
