import config from "@payload-config";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { subWeeks } from "date-fns";
import ical, { ICalCalendarMethod } from "ical-generator";
import { getPayload } from "payload";
import type { Event, Location } from "@/payload-types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "calendar-tokens",
    where: { token: { equals: token } },
    limit: 1,
  });

  if (result.totalDocs === 0) {
    return new Response("Not found", { status: 404 });
  }

  const calendarToken = result.docs[0];
  const userId =
    typeof calendarToken.user === "number"
      ? calendarToken.user
      : calendarToken.user.id;

  const oneWeekAgo = subWeeks(new Date(), 1);

  const signups = await payload.find({
    collection: "signups",
    where: {
      user: { equals: userId },
      "event.end_date": { greater_than_equal: oneWeekAgo },
    },
    depth: 2,
    pagination: false,
  });

  const calendar = ical({
    name: process.env.ORG_NAME
      ? `${process.env.ORG_NAME} Schedule`
      : "De Sering Schedule",
    method: ICalCalendarMethod.PUBLISH,
  });

  for (const signup of signups.docs) {
    const event = signup.event;
    if (!event || typeof event === "number") continue;

    const typedEvent = event as Event;

    const location =
      (typedEvent.locations ?? [])
        .filter((l): l is Location => typeof l !== "number")
        .map((l) => l.address ?? l.title)
        .filter(Boolean)
        .join(", ") || process.env.ORG_ADDRESS;

    const description = typedEvent.description
      ? convertLexicalToPlaintext({
          data: typedEvent.description as SerializedEditorState,
        })
      : undefined;

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
