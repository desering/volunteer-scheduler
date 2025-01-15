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
import { format } from "date-fns/format";
import {
  For,
  Match,
  Show,
  Switch,
  createResource,
  createSignal,
} from "solid-js";
import {
  Box,
  type BoxProps,
  Container,
  Flex,
  Grid,
  panda,
  splitCssProps,
} from "styled-system/jsx";
import type { EventsByDay, RenderedEvent } from "~/utils/map-events";
import type { User } from "../../../../shared/payload-types";
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

  // seperation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
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
                      {(event) => {
                        const length = event.doc.signups?.docs?.length ?? 0;
                        return (
                          <panda.button
                            onClick={() => {
                              setIsDrawerOpen(true);
                              setSelectedEvent(event);
                            }}
                            backgroundColor={{
                              base: "colorPalette.1",
                              _dark: "colorPalette.4",
                            }}
                            paddingX="4"
                            paddingY="6"
                            cursor="pointer"
                            textAlign="left"
                            borderRadius="l3"
                            class="group"
                          >
                            <panda.p>
                              {format(event.start_date, "HH:mm")} -{" "}
                              {format(event.end_date, "HH:mm")}
                            </panda.p>

                            <panda.h5 fontSize="xl" fontWeight="semibold">
                              {event.doc.title}
                            </panda.h5>

                            <Show when={event.descriptionHtml}>
                              {(html) => (
                                <panda.div
                                  color="colorPalette.3"
                                  _groupHover={{ color: "colorPalette.11" }}
                                  innerHTML={html()}
                                />
                              )}
                            </Show>

                            <panda.div marginTop="4">
                              <Switch>
                                <Match when={length === 0}>
                                  Nobody signed up yet :( be the first!
                                </Match>
                                <Match when={length !== 0}>
                                  {`${length} ${length === 1 ? "person" : "people"} signed up!`}
                                </Match>
                              </Switch>
                            </panda.div>
                          </panda.button>
                        );
                      }}
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
