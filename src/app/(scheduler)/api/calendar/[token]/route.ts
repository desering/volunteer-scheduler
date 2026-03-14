import config from "@payload-config";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { subDays } from "date-fns";
import ical, { ICalCalendarMethod } from "ical-generator";
import { getPayload } from "payload";
import type { Event, Location, Role } from "@/payload-types";

const PAST_EVENT_RETENTION_DAYS = 7;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "calendar-tokens",
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

    const location =
      (typedEvent.locations ?? [])
        .filter((l): l is Location => typeof l !== "number")
        .map((l) => [l.title, l.address].filter(Boolean).join(", "))
        .join("; ") || process.env.ORG_ADDRESS;

    const roleTitle =
      typeof signup.role === "object"
        ? (signup.role as Role).title
        : "Volunteer";

    const eventDescription = typedEvent.description
      ? convertLexicalToPlaintext({
          data: typedEvent.description as SerializedEditorState,
        })
      : "";

    const description = `You're joining as: ${roleTitle}\nDetails:\n${eventDescription}`;

    calendar.createEvent({
      id: String(typedEvent.id),
      summary: typedEvent.title,
      start: new Date(typedEvent.start_date),
      end: new Date(typedEvent.end_date),
      location: location || undefined,
      description: { plain: description },
    });
  }

  return new Response(calendar.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="schedule.ics"',
    },
  });
}
