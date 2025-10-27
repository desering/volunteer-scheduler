"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import { useMemo, useState } from "react";
import { Box, type BoxProps, Container, Grid } from "styled-system/jsx";
import { EventButton } from "@/components/event-button";
import { EventDetailsDrawer } from "@/components/event-details-sheet";
import { NoEventsMessage } from "@/components/event-overview/no-events-message";
import type { GroupedEventsByDay } from "@/lib/mappers/map-events";
import { DateSelect } from "./date-select";

type Props = {
  events?: GroupedEventsByDay;
};

export const EventOverview = ({
  events: initialEvents,
  ...cssProps
}: Props & BoxProps) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedEventId, setSelectedEventId] = useState<number>();

  // separation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: events, refetch } = useQuery<GroupedEventsByDay>({
    queryKey: ["eventsByDay"],
    queryFn: async () =>
      fetch("/api/events/overview").then((res) => res.json()),
    initialData: () => {
      return initialEvents;
    },
  });

  const completeDateRange = useMemo(() => {
    if (!events) return [];

    const entries = Object.entries(events);
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
  }, [events]);

  const eventsOnSelectedDate = useMemo(() => {
    if (!events) return;
    const [, filteredEvents] =
      Object.entries(events).find(([date]) => isSameDay(date, selectedDate)) ??
      [];
    return filteredEvents;
  }, [events, selectedDate]);

  if (!events) {
    return "Something went wrong, please try again later.";
  }

  return (
    <Box {...(cssProps as BoxProps)}>
      <DateSelect
        selectedDate={selectedDate}
        items={completeDateRange}
        onDateSelect={setSelectedDate}
      />
      <Container>
        <Grid gap="4">
          {eventsOnSelectedDate?.map((event) => {
            const signups = event.doc.signups?.docs?.length;
            return (
              <EventButton.Root
                key={event.doc.id}
                onClick={() => {
                  setIsDrawerOpen(true);
                  setSelectedEventId(event.doc.id);
                }}
              >
                <EventButton.Time
                  startDate={event.start_date}
                  endDate={event.end_date}
                />
                <EventButton.Title>{event.doc.title}</EventButton.Title>
                <EventButton.Description>
                  {event.doc.description && (
                    <RichText data={event.doc.description} />
                  )}
                </EventButton.Description>

                <Box marginTop="4">
                  {signups === 0
                    ? "Nobody signed up yet :( be the first!"
                    : `${signups} ${signups === 1 ? "person" : "people"} signed up!`}
                </Box>
              </EventButton.Root>
            );
          }) ?? <NoEventsMessage />}
        </Grid>
      </Container>
      <EventDetailsDrawer
        open={isDrawerOpen}
        eventId={selectedEventId}
        onClose={() => {
          setIsDrawerOpen(false);
          refetch();
        }}
        onExitComplete={() => setSelectedEventId(undefined)}
      />
    </Box>
  );
};
