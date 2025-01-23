import { For } from "solid-js";
import { Container } from "styled-system/jsx/container";
import { Flex } from "styled-system/jsx/flex";
import type { RenderedEvent } from "~/utils/map-events";
import { EventButton } from "../event-button";

type Props = {
  events: RenderedEvent[];
};

export const UpcomingEventsList = (props: Props) => {
  return (
    <Container>
      <Flex flexDirection="column" gap="4">
        <For each={props.events}>
          {(event) => (
            <EventButton
              startDate={new Date(event.start_date)}
              endDate={new Date(event.end_date)}
              title={event.doc.title}
              description={event.descriptionHtml}
              onClick={() => {
                //   setIsDrawerOpen(true);
                //   setSelectedEvent(event);
              }}
              signupsAmount={event.doc.signups?.docs?.length ?? 0}
            />
          )}
        </For>
      </Flex>
    </Container>
  );
};
