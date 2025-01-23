import { actions } from "astro:actions";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import { For, Show, createResource, createSignal } from "solid-js";
import {
  Box,
  type BoxProps,
  Container,
  Grid,
  splitCssProps,
} from "styled-system/jsx";
import type { EventsByDay, RenderedEvent } from "~/utils/map-events";
import type { User } from "../../../../shared/payload-types";
import { EventButton } from "../event-button";
import { EventDetailsDrawer } from "../event-details-sheet";
import { DateSelect } from "./date-select";

type Props = {
  user?: User;
  events?: EventsByDay;
};

export const EventOverview = (props: Props & BoxProps) => {
  const [cssProps, localProps] = splitCssProps(props);
  const [selectedDate, setSelectedDate] = createSignal(startOfDay(new Date()));
  const [selectedEvent, setSelectedEvent] = createSignal<RenderedEvent>();

  // separation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const [events, { refetch }] = createResource(
    async () => (await actions.getEventsByDay()).data,
    {
      initialValue: props.events,
      ssrLoadFrom: "initial",
    },
  );

  return (
    <Show when={events.latest} fallback={"Something went wrong :("}>
      {(events) => {
        const allDates = () => {
          const entries = Object.entries(events());
          const start = startOfDay(new Date()); // add some disabled buttons
          const end = entries.reduce((max, [date]) => {
            const d = new Date(date);
            return d > max ? d : max;
          }, startOfDay(new Date()));

          return [
            // fake days
            ...eachDayOfInterval({
              start: subMonths(start, 1),
              end: subDays(start, 1),
            }).map((date) => ({ date, hasEvents: false, isPublished: false })),
            // real days
            ...eachDayOfInterval({ start, end }).map((date) => {
              const [, events] =
                entries.find(([d]) => isSameDay(new Date(d), date)) ?? [];
              const hasEvents = (events ?? []).length > 0;

              return { date, hasEvents, isPublished: true };
            }),
            // fake days
            ...eachDayOfInterval({
              start: addDays(end, 1),
              end: addMonths(end, 1),
            }).map((date) => ({ date, hasEvents: false, isPublished: false })),
          ];
        };

        return (
          <Box {...(cssProps as BoxProps)}>
            <DateSelect
              date={selectedDate()}
              dates={allDates()}
              onDateSelect={setSelectedDate}
            />
            <Container>
              <Grid gap="4">
                <Show
                  keyed
                  when={Object.entries(events()).find(([date]) =>
                    isSameDay(date, selectedDate()),
                  )}
                >
                  {([, events]) => (
                    <For each={events}>
                      {(event) => (
                        <EventButton
                          startDate={event.start_date}
                          endDate={event.end_date}
                          title={event.doc.title}
                          description={event.descriptionHtml}
                          onClick={() => {
                            setIsDrawerOpen(true);
                            setSelectedEvent(event);
                          }}
                          signupsAmount={event.doc.signups?.docs?.length ?? 0}
                        />
                      )}
                    </For>
                  )}
                </Show>
              </Grid>
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
          </Box>
        );
      }}
    </Show>
  );
};
