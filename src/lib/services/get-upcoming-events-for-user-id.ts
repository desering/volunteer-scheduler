"use server";

import { prepareEvent } from "@/lib/mappers/map-events";
import config from "@payload-config";
import type { Event } from "@payload-types";
import { startOfDay } from "date-fns";
import { getPayload } from "payload";

export type UpcomingEventsForUserId = Awaited<
  ReturnType<typeof getUpcomingEventsForUserId>
>;
export async function getUpcomingEventsForUserId(id: number) {
  const payload = await getPayload({ config });

  const signups = await payload.find({
    collection: "signups",
    depth: 1,
    where: {
      user: { equals: id },
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
}
