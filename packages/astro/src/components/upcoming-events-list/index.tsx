import type { User } from "@payload-types";
import { actions } from "astro:actions";
import { For, createResource, createSignal } from "solid-js";
import { Container } from "styled-system/jsx/container";
import { Flex } from "styled-system/jsx/flex";
import type { DisplayableEvent } from "~/utils/map-events";
import { EventButton } from "../event-button";
import { EventDetailsDrawer } from "../event-details-sheet";

type Props = {
  user: User;
  events?: DisplayableEvent[];
};

export const UpcomingEventsList = (props: Props) => {
  const [selectedEvent, setSelectedEvent] = createSignal<DisplayableEvent>();
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const [events, { refetch }] = createResource(
    async () => (await actions.getUpcomingEventsForCurrentUser()).data,
    {
      initialValue: props.events,
      ssrLoadFrom: "initial",
    },
  );

  return (
    <>
      <Container>
        <Flex flexDirection="column" gap="4">
          <For each={events.latest}>
            {(event) => (
              <EventButton.Root
                onClick={() => {
                  setIsDrawerOpen(true);
                  setSelectedEvent(event);
                }}
              >
                <EventButton.DateTime
                  startDate={new Date(event.start_date)}
                  endDate={new Date(event.end_date)}
                />
                <EventButton.Title>{event.doc.title}</EventButton.Title>
                <EventButton.Description innerHTML={event.descriptionHtml} />
              </EventButton.Root>
            )}
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
