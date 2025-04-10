import {getEventsByDay} from "@/lib/services/get-events-by-day";

export async function GET(request: Request) {
  return Response.json(await getEventsByDay());
}
