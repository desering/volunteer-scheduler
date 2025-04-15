import { getEventDetails } from "@/lib/services/get-event-details";

export async function GET(request: Request) {
  const id = (await request.formData()).get("id") as string; // todo: is this correct? Do I need zod parsing here?
  return Response.json(await getEventDetails(1));
}
