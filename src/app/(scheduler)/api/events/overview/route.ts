import { getEventsByDay } from "@/lib/services/get-events-by-day";

export const GET = async () => Response.json(await getEventsByDay(undefined));
