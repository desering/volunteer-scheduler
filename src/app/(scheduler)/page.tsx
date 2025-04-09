import { EventOverview } from "@/components/event-overview";
import { headers as getHeaders } from "next/dist/server/request/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { getEventsByDay } from "@/lib/services/get-events-by-day";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  const eventsByDay = await getEventsByDay();

  return (
    <EventOverview
      user={user ?? undefined}
      events={eventsByDay}
      flex="1"
      marginTop="4"
    />
  );
}
