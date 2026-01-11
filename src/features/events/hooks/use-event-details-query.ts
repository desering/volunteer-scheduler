import { queryOptions, useQuery } from "@tanstack/react-query";
import type { EventDetails } from "@/lib/services/get-event-details";

export const eventDetailsQueryConfig = (id?: number) =>
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
  });

export const useEventDetailsQuery = (id?: number) =>
  useQuery(eventDetailsQueryConfig(id));
