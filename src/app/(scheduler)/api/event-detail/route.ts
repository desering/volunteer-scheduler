import {getEventDetails} from "@/actions/get-event-detail";

export async function GET(request: Request) {
  const id = 1; // todo how to get this from request?
  return Response.json(await getEventDetails(id));
}
