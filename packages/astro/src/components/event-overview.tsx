import { actions } from "astro:actions";
import { format } from "date-fns/format";
import {
  For,
  Match,
  Show,
  Switch,
  createResource,
  createSignal,
} from "solid-js";
import { Flex, type FlexProps, panda, splitCssProps } from "styled-system/jsx";
import type { RenderedEvent, EventsByDay } from "~/utils/map-events";
import type { User } from "../../../shared/payload-types";
import { EventDetailsDrawer } from "./event-details-drawer";

type Props = {
  user?: User;
  events?: EventsByDay;
};

export const EventOverview = (props: Props & FlexProps) => {
  const [cssProps, localProps] = splitCssProps(props);
  const [selectedEvent, setSelectedEvent] = createSignal<RenderedEvent>();
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
      {(events) => (
        <>
          <Flex gap="4" overflow="auto" {...(cssProps as FlexProps)}>
            <For each={Object.entries(events())}>
              {([, events]) => (
                <panda.div>
                  <panda.h1 fontSize="6xl" fontWeight="bold" textAlign="center">
                    {format(events[0].start_date, "dd")}
                  </panda.h1>

                  <panda.h3
                    fontSize="xl"
                    fontWeight="semibold"
                    marginBottom="4"
                  >
                    {format(events[0].start_date, "iii")}
                  </panda.h3>

                  <Flex
                    flexDir="column"
                    gap="4"
                    width={{ base: "100%", md: "300px" }}
                  >
                    <For each={events}>
                      {(event) => {
                        const length = event.doc.signups?.docs?.length ?? 0;
                        return (
                          <panda.button
                            onClick={() => {
                              setIsDrawerOpen(true);
                              setSelectedEvent(event);
                            }}
                            backgroundColor="colorPalette.12"
                            color="colorPalette.1"
                            padding="4"
                            cursor="pointer"
                            textAlign="left"
                            _hover={{
                              backgroundColor: "colorPalette.1",
                              color: "colorPalette.12",
                              boxShadow: "inset 0 0 0 2px",
                              boxShadowColor: "colorPalette.12",
                            }}
                            _focusVisible={{
                              outline: "2px solid",
                              outlineColor: "colorPalette.12",
                              outlineOffset: "2px",
                            }}
                            class="group"
                          >
                            <panda.p>
                              {format(event.start_date, "HH:mm")} -{" "}
                              {format(event.end_date, "HH:mm")}
                            </panda.p>

                            <panda.h5
                              color="colorPalette.1"
                              fontSize="xl"
                              fontWeight="semibold"
                              _groupHover={{
                                color: "colorPalette.12",
                              }}
                            >
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
                  </Flex>
                </panda.div>
              )}
            </For>
          </Flex>
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
      )}
    </Show>
  );
};
