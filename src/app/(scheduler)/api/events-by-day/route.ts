import { getEventsByDay } from "@/lib/services/get-events-by-day";

export async function GET() {
  return Response.json(await getEventsByDay());
}
