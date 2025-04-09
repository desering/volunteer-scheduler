"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import {
  Box,
  type BoxProps,
  Container,
  Grid,
  splitCssProps,
  panda,
} from "styled-system/jsx";
import type { EventsByDay, DisplayableEvent } from "@/utils/map-events";
import type { User } from "@/payload-types";
import { EventButton } from "@/components/event-button";
import { EventDetailsDrawer } from "@/components/event-details-sheet";
import { DateSelect } from "./date-select";
import { link } from "styled-system/recipes";
import {getEventsByDay} from "@/actions/get-events-by-day";
import {useState} from "react";

type Props = {
  user?: User;
  events?: EventsByDay;
};

export default function EventOverview(props: Props & BoxProps) {
  const [cssProps, localProps] = splitCssProps(props);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<DisplayableEvent>();

  // separation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [events, setEvents] = useState(localProps.events);
  // (await getEventsByDay()).data

  if (!events) {
    return "Something went wrong :("
  }

  const allDates = () => {
    const entries = Object.entries({}); // TODO DATA LOADING
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
    <>
      <NoEventsMessage />
    </>
    // {
    //   (events) => {
    //     return (
    //       <Box {...(cssProps as BoxProps)}>
    //         <DateSelect
    //           date={selectedDate()}
    //           dates={allDates()}
    //           onDateSelect={setSelectedDate}
    //         />
    //         <Container>
    //           <Grid gap="4">
    //               {
    //                   if (Object.entries(events()).find(([date]) =>isSameDay(date, selectedDate()))) {
    //                                       {([, events]) => (
    //                                           <For each={events}>
    //                                       {(event) => {
    //                                           const signups = event.doc.signups?.docs?.length;
    //                                           return (
    //                                               <EventButton.Root
    //                                                   onClick={() => {
    //                                                       setIsDrawerOpen(true);
    //                                                       setSelectedEvent(event);
    //                                                   }}
    //                                               >
    //                                                   <EventButton.Time
    //                                                       startDate={event.start_date}
    //                                                       endDate={event.end_date}
    //                                                   />
    //                                                   <EventButton.Title>
    //                                                       {event.doc.title}
    //                                                   </EventButton.Title>
    //                                                   <EventButton.Description
    //                                                       innerHTML={event.descriptionHtml}
    //                                                   />
    //
    //                                                   <Box marginTop="4">
    //                                                       <Switch>
    //                                                           <Match when={signups === 0}>
    //                                                               Nobody signed up yet :( be the first!
    //                                                           </Match>
    //                                                           <Match when={signups !== 0}>
    //                                                               {`${signups} ${signups === 1 ? "person" : "people"} signed up!`}
    //                                                           </Match>
    //                                                       </Switch>
    //                                                   </Box>
    //                                               </EventButton.Root>
    //                                           );
    //                                       }}
    //                                   </For>
    //                                     )}
    //                   } else {
    //                       NoEventsMessage
    //                   }
    //               }
    //           </Grid>
    //         </Container>
    //         <EventDetailsDrawer
    //           user={localProps.user}
    //           open={isDrawerOpen()}
    //           event={selectedEvent()}
    //           onClose={() => {
    //             setIsDrawerOpen(false);
    //             refetch();
    //           }}
    //           onExitComplete={() => setSelectedEvent(undefined)}
    //         />
    //       </Box>
    //     );
    //   }
    // }
  );
};

const NoEventsMessage = () => {
  return (
    <panda.div
      backgroundColor={{
        base: "colorPalette.1",
        _dark: "colorPalette.4",
      }}
      borderRadius="l3"
      padding="6"
    >
      <panda.h5
        color="colorPalette.12"
        fontSize="xl"
        fontWeight="semibold"
        marginBottom={3}
      >
        There are no shifts yet, have a look at other days.
      </panda.h5>
      <panda.p marginBottom={3}>
        For shifts <b>up to February 25th</b>, click here:
        <br />
        <a
          href="https://docs.google.com/spreadsheets/d/1HDv8_Du7ssRMQfF4WtDyzar9YhL4nZfKg_lQ7PjYlYA/edit"
          target="_blank"
          className={link()}
        >
          Volunteer Schedule Spreadsheet
        </a>
      </panda.p>
    </panda.div>
  );
};
