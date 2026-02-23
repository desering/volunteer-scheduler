import type { NextRequest } from "next/server";
import { getUpcomingEventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";
import { getUser } from "@/lib/services/get-user";

export const GET = async (request: NextRequest) => {
  const { user } = await getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const sort = request?.nextUrl?.searchParams.get("sort")?.split(",");

  const events = await getUpcomingEventsForUserId(user.id, { sort });

  return Response.json(events);
};
