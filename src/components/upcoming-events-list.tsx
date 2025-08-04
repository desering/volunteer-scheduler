"use client";

import { EventButton } from "@/components/event-button";
import { EventDetailsDrawer } from "@/components/event-details-sheet";
import type { DisplayableEvent } from "@/lib/mappers/map-events";
import type { getUpcomingEventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";
import type { Event, Role, Signup, User } from "@payload-types";
import { Clock, PersonStanding } from "lucide-react";
import { useState } from "react";
import { Box, HStack, panda } from "styled-system/jsx";
import { Container } from "styled-system/jsx/container";
import { Flex } from "styled-system/jsx/flex";

type Props = {
  user: User;
  data?: Awaited<ReturnType<typeof getUpcomingEventsForUserId>>;
};

export const UpcomingEventsList = (props: Props) => {
  const [selectedEvent, setSelectedEvent] = useState<DisplayableEvent>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [events, setEvents] = useState(props.data?.events);

  // todo: implement refetching of upcoming events
  // const refetch = async () => {
  //   setEvents((await getUpcomingEventsForUserId(props.user.id)).events);
  // }

  const eventsList = events?.map((event: DisplayableEvent) => {
    const signup = props.data?.signups.docs.find(
      (signup: Signup) => (signup.event as Event).id === event.doc.id,
    );
    const roleTitle = (signup?.role as Role)?.title;

    return (
      <EventButton.Root
        key={event.doc.id}
        onClick={() => {
          setIsDrawerOpen(true);
          setSelectedEvent(event);
        }}
        display="flex"
        flexDirection="column"
        gap="3"
      >
        <EventButton.Title>{event.doc.title}</EventButton.Title>

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
        <EventButton.Description
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: event.descriptionHtml || "",
          }}
        />
      </EventButton.Root>
    );
  });

  return (
    <>
      <Container>
        <Flex flexDirection="column" gap="4">
          {eventsList}
        </Flex>
      </Container>
      <EventDetailsDrawer
        user={props.user}
        open={isDrawerOpen}
        eventId={selectedEvent?.doc.id}
        onClose={() => {
          setIsDrawerOpen(false);
          //await refetch(); // todo: replace astro createResource with useState plus ??? above
        }}
        onExitComplete={() => setSelectedEvent(undefined)}
      />
    </>
  );
};
