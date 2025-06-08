'use client'

import { EventButton } from '@/components/event-button'
import { EventDetailsDrawer } from '@/components/event-details-sheet'
import { NoEventsMessage } from '@/components/event-overview/no-events-message'
import type { DisplayableEvent, EventsByDay } from '@/lib/mappers/map-events'
import type { User } from '@payload-types'
import { useQuery } from '@tanstack/react-query'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  subDays,
  subMonths,
} from 'date-fns'
import { useState } from 'react'
import { Box, type BoxProps, Container, Grid, splitCssProps } from 'styled-system/jsx'
import { DateSelect } from './date-select'

type Props = {
  user?: User
  events?: EventsByDay
}

export const EventOverview = (props: Props & BoxProps) => {
  const [cssProps, localProps] = splitCssProps(props)
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const [selectedEventId, setSelectedEventId] = useState<string>()

  // separation of selectedEvent and isDrawerOpen, otherwise breaks exitAnim
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { data: events, refetch } = useQuery<EventsByDay>({
    queryKey: ['eventsByDay'],
    queryFn: async () => fetch('/api/events-by-day').then((res) => res.json()),
    initialData: localProps.events,
  })

  if (!events) {
    return 'Something went wrong, please try again later.'
  }

  const entries = Object.entries(events)
  const start = startOfDay(new Date()) // add some disabled buttons
  const end = entries.reduce((max, [date]) => {
    const d = new Date(date)
    return d > max ? d : max
  }, startOfDay(new Date()))

  const allDates = [
    // fake days
    ...eachDayOfInterval({
      start: subMonths(start, 1),
      end: subDays(start, 1),
    }).map((date) => ({ date, hasEvents: false, isPublished: false })),
    // real days
    ...eachDayOfInterval({ start, end }).map((date) => {
      const [, events] = entries.find(([d]) => isSameDay(new Date(d), date)) ?? []
      const hasEvents = (events ?? []).length > 0

      return { date, hasEvents, isPublished: true }
    }),
    // fake days
    ...eachDayOfInterval({
      start: addDays(end, 1),
      end: addMonths(end, 1),
    }).map((date) => ({ date, hasEvents: false, isPublished: false })),
  ]

  const [, todayEvents] =
    Object.entries(events).find(([date]) => isSameDay(date, selectedDate)) ?? []

  return (
    <Box {...(cssProps as BoxProps)}>
      <DateSelect date={selectedDate} dates={allDates} onDateSelect={setSelectedDate} />
      <Container>
        <Grid gap="4">
          {todayEvents?.map((event) => {
            const signups = event.doc.signups?.docs?.length
            return (
              <EventButton.Root
                key={event.doc.id}
                onClick={() => {
                  setIsDrawerOpen(true)
                  setSelectedEvent(event)
                }}
              >
                <EventButton.Time startDate={event.start_date} endDate={event.end_date} />
                <EventButton.Title>{event.doc.title}</EventButton.Title>
                <EventButton.Description
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{
                    __html: event.descriptionHtml || '',
                  }}
                />

                <Box marginTop="4">
                  {signups === 0
                    ? 'Nobody signed up yet :( be the first!'
                    : `${signups} ${signups === 1 ? 'person' : 'people'} signed up!`}
                </Box>
              </EventButton.Root>
            )
          }) ?? <NoEventsMessage />}
        </Grid>
      </Container>
      <EventDetailsDrawer
        user={localProps.user}
        open={isDrawerOpen}
        eventId={selectedEventId}
        onClose={() => {
          setIsDrawerOpen(false)
          refetch()
        }}
        onExitComplete={() => setSelectedEventId(undefined)}
      />
    </Box>
  )
}
