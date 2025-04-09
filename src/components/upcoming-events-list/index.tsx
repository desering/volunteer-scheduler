import { actions } from "astro:actions";
import type { Event, Role, Signup, User } from "@payload-types";
import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import { Box, Divider, HStack, panda } from "../../../styled-system/jsx";
import { Container } from "../../../styled-system/jsx/container";
import { Flex } from "../../../styled-system/jsx/flex";
import type { DisplayableEvent } from "~/utils/map-events";
import { EventButton } from "../event-button";
import { EventDetailsDrawer } from "../event-details-sheet";

import PersonStanding from "lucide-react/icons/person-standing";
import Clock from "lucide-react/icons/clock";

type Props = {
  user: User;
  data?: Awaited<
    ReturnType<typeof actions.getUpcomingEventsForCurrentUser>
  >["data"];
};

export const UpcomingEventsList = (props: Props) => {
  const [selectedEvent, setSelectedEvent] = createSignal<DisplayableEvent>();
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const [events, { refetch }] = createResource(
    async () => (await actions.getUpcomingEventsForCurrentUser()).data,
    {
      initialValue: props.data,
      ssrLoadFrom: "initial",
    },
  );

  createEffect(() => console.log(events.latest));

  return (
    <>
      <Container>
        <Flex flexDirection="column" gap="4">
          <For each={events.latest?.events}>
            {(event) => {
              const signup = props.data?.signups.docs.find(
                (signup: Signup) => (signup.event as Event).id === event.doc.id,
              );
              const roleTitle = (signup?.role as Role)?.title;

              return (
                <EventButton.Root
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
                  <EventButton.Description innerHTML={event.descriptionHtml} />
                </EventButton.Root>
              );
            }}
          </For>
        </Flex>
      </Container>
      <EventDetailsDrawer
        user={props.user}
        open={isDrawerOpen()}
        event={selectedEvent()}
        onClose={() => {
          setIsDrawerOpen(false);
          refetch();
        }}
        onExitComplete={() => setSelectedEvent(undefined)}
      />
    </>
  );
};
