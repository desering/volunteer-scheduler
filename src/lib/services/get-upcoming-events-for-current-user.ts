import { startOfDay } from "date-fns";
import {headers} from "next/headers";
import {unauthorized} from "next/navigation";
import {getPayload} from "payload";
import config from "@payload-config";
import type { Event } from "@payload-types";
import { prepareEvent } from "@/lib/mappers/map-events";

export async function getUpcomingEventsForCurrentUser() {
  const payload = await getPayload({config});
  const { user } = await payload.auth({headers: await headers()});

  if (!user) {
    unauthorized();
  }

  const signups = await payload.find({
    collection: "signups",
    depth: 1,
    where: {
      user: { equals: user.id },
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
