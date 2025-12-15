import type { NextRequest } from "next/server";
import { getEventDetails } from "@/lib/services/get-event-details";
import { runRequest } from "@/utils/http";

const handler = async (
  _req: NextRequest,
  ctx: RouteContext<"/api/events/[id]">,
) => {
  const { id } = await ctx.params;

  const parsedId = Number(id);

  if (Number.isNaN(parsedId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }
  return Response.json(await getEventDetails(parsedId));
};

export const GET = runRequest("/api/events/[id]", handler);
