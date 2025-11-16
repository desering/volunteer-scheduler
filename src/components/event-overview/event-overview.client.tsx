"use client";

import { utc } from "@date-fns/utc";
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
import {
  type EventsGroupedByDay,
  groupEventsByDate,
} from "@/lib/mappers/group-events-by-date";
import type { Event } from "@/payload-types";
import { DateSelect } from "./date-select";
import { Badge } from "@/components/ui/badge";

type Props = {
  placeholder?: EventsGroupedByDay;
};

export const EventOverviewClient = ({
  placeholder: initialEvents,
  ...cssProps
}: Props & BoxProps) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedEventId, setSelectedEventId] = useState<number>();

  // separation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: events,
    refetch,
    error,
  } = useQuery<EventsGroupedByDay>({
    queryKey: ["eventsByDay", initialEvents],
    queryFn: async () => {
      const url = "/api/events?";
      const searchParams = new URLSearchParams({
        min_date: startOfDay(new Date(), { in: utc }).toISOString(),
      });

      const res = await fetch(url + searchParams);
      const events = (await res.json()) as unknown as Event[];

      return groupEventsByDate(events);
    },
    placeholderData: initialEvents,
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

  if (error) {
    return `Something went wrong, please try again later. ${error.message}`;
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
            const signups = event.signups?.docs?.length;
            return (
              <EventButton.Root
                key={event.id}
                onClick={() => {
                  setIsDrawerOpen(true);
                  setSelectedEventId(event.id);
                }}
              >
                <EventButton.Time
                  startDate={event.start_date}
                  endDate={event.end_date}
                />
                <EventButton.Title>{event.title}</EventButton.Title>
                {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
                  <Box display="flex" gap="2" marginY="2">
                    {event.tags.map((tag) =>
                      typeof tag === "object" && tag !== null ? (
                        <Badge key={tag.id}>{tag.text}</Badge>
                      ) : null
                    )}
                  </Box>
                )}
                <EventButton.Description>
                  {event.description && <RichText data={event.description} />}
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
