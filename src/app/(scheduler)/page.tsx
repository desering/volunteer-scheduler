"use server";

import { EventOverview } from "@/components/event-overview";
import { getEventsByDay } from "@/lib/services/get-events-by-day";

export default async function Page() {
  const eventsByDay = await getEventsByDay(undefined);

  return <EventOverview events={eventsByDay} flex="1" marginTop="4" />;
}
