"use server";

import { EventOverview } from "@/components/event-overview";
import { getEventsGroupedByDay } from "@/lib/services/get-events-grouped-by-day";

export default async function Page() {
  const eventsByDay = await getEventsGroupedByDay();

  return <EventOverview events={eventsByDay} flex="1" marginTop="4" />;
}
