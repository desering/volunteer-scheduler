import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type CreateSignupRequest,
  createSignup,
} from "@/actions/create-signup";
import { eventDetailsQueryConfig } from "./use-event-details-query";

export function useCreateSignupMutation(
  eventId: CreateSignupRequest["eventId"],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: CreateSignupRequest["roleId"]) =>
      createSignup({ eventId, roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries(eventDetailsQueryConfig(eventId));
    },
  });
}
