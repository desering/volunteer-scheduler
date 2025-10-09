import { getUpcomingEventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";
import { getUser } from "@/lib/services/get-user";

export const GET = async () => {
  const { user } = await getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const events = getUpcomingEventsForUserId(user.id);

  return Response.json(events);
};
