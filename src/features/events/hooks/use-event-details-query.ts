import { queryOptions, useQuery } from "@tanstack/react-query";
import type { EventDetails } from "@/lib/local-models/event-details";

export const eventDetailsQueryConfig = (
  id?: number,
  initialData?: EventDetails,
) =>
  queryOptions<EventDetails>({
    queryKey: ["events", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      return await res.json();
    },

    enabled: !!id,
    refetchInterval: 1000 * 60, // refetch every minute
    refetchOnWindowFocus: "always",
    refetchOnMount: true,

    initialData,
  });

export const useEventDetailsQuery = (id?: number, initialData?: EventDetails) =>
  useQuery(eventDetailsQueryConfig(id, initialData));
