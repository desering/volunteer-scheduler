"use client";

import type { Event, Role, Signup } from "@payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useQuery } from "@tanstack/react-query";
import { Clock, PersonStanding } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, HStack, panda } from "styled-system/jsx";
import { Flex } from "styled-system/jsx/flex";
import { EventButton } from "@/components/event-button";
import type { EventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";

type Props = {
  initialData?: EventsForUserId;
  refetchUrl: string;
};

export const UserEventsList = (props: Props) => {
  const { data } = useQuery<EventsForUserId>({
    queryKey: ["events", "users", "upcoming", props.initialData?.events],
    queryFn: async () =>
      await fetch(props.refetchUrl).then((res) => res.json()),
    initialData: props.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const eventsList = data?.events?.map((event) => {
    const signup = props.initialData?.signups.docs.find(
      (signup: Signup) => (signup.event as Event).id === event.id,
    );

    const roleTitle = (signup?.role as Role)?.title;

    return (
      <EventButton.Root
        key={event.id}
        href={`/events/${event.id}`}
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "3",
          border: "1px solid",
          borderColor: { base: "transparent", _hover: "border.default" },
        })}
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
  );
};
