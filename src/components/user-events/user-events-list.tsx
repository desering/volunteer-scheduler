"use client";

import type { Event, Role, Signup } from "@payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useQuery } from "@tanstack/react-query";
import { Clock, PersonStanding } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, HStack, panda } from "styled-system/jsx";
import { Flex } from "styled-system/jsx/flex";
import { EventButton } from "@/components/event-button";
import { EventDetailsDrawer } from "@/components/event-details-sheet";
import type { EventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";
import { Button } from "../ui/styled/button";

type UserEventsListProps = {
  initialData?: EventsForUserId;
  refetchUrl: string;
  filterOptions?: { sort?: string[] };
};

export const UserEventsList = (props: UserEventsListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState(props.filterOptions?.sort);

  const { data, refetch } = useQuery<EventsForUserId>({
    queryKey: [
      "events",
      "users",
      "upcoming",
      props.initialData?.events,
      sortOrder,
    ],
    queryFn: async () => {
      return await fetch(`${props.refetchUrl}?sort=${sortOrder}`).then((res) =>
        res.json(),
      );
    },
    initialData: props.initialData,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const eventsList = data?.events?.map((event) => {
    const signup = props.initialData?.signups.docs.find(
      (signup: Signup) => (signup.event as Event).id === event.id,
    );

    const roleTitle = (signup?.role as Role)?.title;

    return (
      <EventButton.Root
        key={event.id}
        onClick={() => {
          setIsDrawerOpen(true);
          setSelectedEvent(event);
        }}
        display="flex"
        flexDirection="column"
        gap="3"
        border="1px solid"
        borderColor={{ base: "transparent", _hover: "border.default" }}
      >
        <EventButton.Title>{event.title}</EventButton.Title>

        <Box
          marginInline="-4"
          borderBottom="1px solid"
          borderColor="colorPalette.10"
        />

        <HStack>
          <PersonStanding />
          <Box>
            <panda.p fontWeight="semibold">Role</panda.p>
            <panda.p>{roleTitle}</panda.p>
          </Box>
        </HStack>

        <Box
          marginInline="-4"
          borderBottom="1px solid"
          borderColor="colorPalette.8"
        />

        <HStack>
          <Clock />
          <Box>
            <panda.p fontWeight="semibold">Time</panda.p>
            <EventButton.DateTime
              startDate={new Date(event.start_date)}
              endDate={new Date(event.end_date)}
            />
          </Box>
        </HStack>
        <EventButton.Description>
          {event.description && <RichText data={event.description} />}
        </EventButton.Description>
      </EventButton.Root>
    );
  });

  return (
    <>
      <HStack justify="flex-end" marginBottom="2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSortOrder(() =>
              sortOrder?.[0] === "event.start_date"
                ? ["-event.start_date"]
                : ["event.start_date"],
            )
          }
        >
          {sortOrder?.[0] === "event.start_date"
            ? "Sort Descending"
            : "Sort Ascending"}
        </Button>
      </HStack>

      <Flex flexDirection="column" gap="4">
        {eventsList && eventsList.length > 0 ? (
          eventsList
        ) : (
          <panda.p textAlign="center">
            There are no shifts in your account. Go to{" "}
            <Link href={"/"} className={css({ textDecoration: "underline" })}>
              Shifts
            </Link>{" "}
            and check out what's available!
          </panda.p>
        )}
      </Flex>
      <EventDetailsDrawer
        open={isDrawerOpen}
        eventId={selectedEvent?.id}
        onClose={() => {
          setIsDrawerOpen(false);
          refetch();
        }}
        onExitComplete={() => setSelectedEvent(undefined)}
      />
    </>
  );
};
