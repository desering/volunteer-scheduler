import config from "@payload-config";
import { subDays } from "date-fns";
import ical, { ICalCalendarMethod } from "ical-generator";
import { getPayload } from "payload";
import { buildSignupIcalEventData } from "@/lib/email/build-signup-ical-event-data";
import type { Event, Role } from "@/payload-types";

const PAST_EVENT_RETENTION_DAYS = 7;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "webcal-tokens",
    where: { token: { equals: token } },
    depth: 0,
    limit: 1,
  });

  if (result.totalDocs === 0) {
    return new Response("Not found", { status: 404 });
  }

  const { user: userId } = result.docs[0];

  const signups = await payload.find({
    collection: "signups",
    where: {
      user: { equals: userId },
      "event.end_date": {
        greater_than_equal: subDays(new Date(), PAST_EVENT_RETENTION_DAYS),
      },
    },
    depth: 2,
    pagination: false,
  });

  const calendar = ical({
    name: process.env.ORG_NAME
      ? `${process.env.ORG_NAME} Calendar`
      : "Event Calendar",
    method: ICalCalendarMethod.PUBLISH,
  });

  for (const signup of signups.docs) {
    const event = signup.event;
    if (!event || typeof event === "number") continue;

    const typedEvent = event as Event;

    const role =
      typeof signup.role === "object"
        ? (signup.role as Role)
        : { id: 0, title: "Volunteer" };

    const icalData = await buildSignupIcalEventData(typedEvent, role);

    calendar.createEvent({
      id: icalData.id,
      summary: icalData.summary,
      start: icalData.start,
      end: icalData.end,
      location: icalData.location,
      description: { plain: icalData.description },
    });
  }

  return new Response(calendar.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="schedule.ics"',
    },
  });
}
