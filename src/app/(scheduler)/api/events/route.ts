import { getEventDetails } from "@/lib/services/get-event-details";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = Number(searchParams.get("id"));

  if (Number.isNaN(id)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  return Response.json(await getEventDetails(id));
};
