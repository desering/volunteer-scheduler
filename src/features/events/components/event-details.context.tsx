"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  EventDetails,
  EventDetailsRole,
} from "@/lib/local-models/event-details";
import type { Event, Role, Signup } from "@/payload-types";
import { useAuth } from "@/providers/auth";
import { useCreateSignupMutation } from "../hooks/use-create-signup-mutation";
import { useDeleteSignupMutation } from "../hooks/use-delete-signup-mutation";
import { useEventDetailsQuery } from "../hooks/use-event-details-query";

type EventDetailsContextType = {
  eventId: Event["id"];
  userSignup?: Signup;
  roles: EventDetailsRole[];

  selectedRoleId?: Role["id"];
  setSelectedRoleId: (roleId?: Role["id"]) => void;

  toggleSignup: () => void;

  isBusy: boolean;
};

const EventDetailsContext = createContext<EventDetailsContextType | undefined>(
  undefined,
);

export const EventDetailsProvider = ({
  id: eventId,
  children,
  initialData,
}: {
  id: Event["id"];
  children: ReactNode;
  initialData?: EventDetails;
}) => {
  const { user } = useAuth();
  const { data, isFetching } = useEventDetailsQuery(eventId, initialData);
  const { mutate: createSignup, isPending: isCreating } =
    useCreateSignupMutation(eventId);
  const { mutate: deleteSignup, isPending: isDeleting } =
    useDeleteSignupMutation(eventId);

  const [selectedRoleId, setSelectedRoleId] = useState<Role["id"]>();

  const noSectionRoles = data?.roles || [];
  const sections = data?.sections || [];

  const allRoles = [
    ...noSectionRoles,
    ...sections.flatMap((section) => section.roles),
  ];

  const allSignups = allRoles.flatMap((role) => role.signups);

  const userSignup = allSignups.find((signup) => signup.user === user?.id);

  useEffect(() => {
    if (!userSignup) {
      return;
    }

    setSelectedRoleId(
      allRoles.find((role) => role.signups.some((s) => s.id === userSignup.id))
        ?.id,
    );
  }, [userSignup, allRoles.find]);

  const toggleSignup = () => {
    if (userSignup) {
      deleteSignup();
      return;
    } else if (selectedRoleId) {
      createSignup(selectedRoleId);
    }
  };

  return (
    <EventDetailsContext.Provider
      value={{
        eventId,
        selectedRoleId,
        setSelectedRoleId,
        userSignup,
        roles: allRoles,
        toggleSignup,
        isBusy: isCreating || isDeleting || isFetching,
      }}
    >
      {children}
    </EventDetailsContext.Provider>
  );
};

export const useEventDetails = () => {
  const context = useContext(EventDetailsContext);
  if (!context) {
    throw new Error(
      "useEventDetailsForm must be used within an EventDetailsFormProvider",
    );
  }
  return context;
};
