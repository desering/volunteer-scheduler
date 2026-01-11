import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type DeleteSignupRequest,
  deleteSignup,
} from "@/actions/delete-signup";
import { eventDetailsQueryConfig } from "./use-event-details-query";

export function useDeleteSignupMutation(
  eventId: DeleteSignupRequest["eventId"],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSignup({ eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries(eventDetailsQueryConfig(eventId));
    },
  });
}
