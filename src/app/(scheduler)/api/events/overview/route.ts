import { getEventsGroupedByDay } from "@/lib/services/get-events-grouped-by-day";

export const GET = async () => Response.json(await getEventsGroupedByDay());
