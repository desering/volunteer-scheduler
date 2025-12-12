import { useQuery } from "@tanstack/react-query";
import type { getEventDetails } from "@/lib/services/get-event-details";

export const useEventDetailsQuery = (id?: number) =>
  useQuery({
    queryKey: ["events", id],
    queryFn: async (): ReturnType<typeof getEventDetails> => {
      const res = await fetch(`/api/events/${id}`);
      return await res.json();
    },
    enabled: !!id,
    refetchInterval: 1000 * 60, // refetch every minute
    refetchOnWindowFocus: "always",
  });
