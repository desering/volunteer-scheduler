import { getEventDetails } from "@/lib/services/get-event-details";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");


  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  return Response.json(await getEventDetails(eventId));
}
