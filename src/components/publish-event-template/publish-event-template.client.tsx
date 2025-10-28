"use client";

import { UTCDate, utc } from "@date-fns/utc";
import type { EventTemplate } from "@payload-types";
import { DatePicker, toast } from "@payloadcms/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  getDay,
  isSameDay,
} from "date-fns";
import { useMemo, useState } from "react";
import { cx } from "styled-system/css";
import { Box, Center, Grid, HStack, panda, VStack } from "styled-system/jsx";
import { createEventsFromTemplate } from "@/actions/create-events-from-template";
import { daysOfWeek } from "@/constants/days-of-week";
import { getEventsInPeriod } from "@/lib/services/get-events-in-period";
import { startOfMonth } from "@/utils/utc";
import { Button } from "../ui/button";
import { bleedX, divider, gutterX, gutterY } from "../ui/utils";

export const PublishEventTemplateForm = (props: { doc: EventTemplate }) => {
  const [start, setStart] = useState(startOfMonth(new UTCDate()));
  const [end, setEnd] = useState(endOfMonth(new UTCDate()));
  const [selectedDays, setSelectedDays] = useState<UTCDate[]>([]);

  const createEvents = useMutation({
    mutationFn: () =>
      createEventsFromTemplate(props.doc.id, selectedDays.map(utc)),
    onSuccess: () => {
      setSelectedDays([]);
      existingEvents.refetch();
      toast.success("Events created successfully");
    },
    onError: () => toast.error("Failed to create events"),
  });

  const existingEvents = useQuery({
    queryKey: ["calender", start, end],
    queryFn: async () => await getEventsInPeriod(start, end),
    refetchOnMount: "always",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: only rerun after refresh data
  const groupedDays = useMemo(() => {
    const allDays = eachDayOfInterval({
      start,
      end,
    });

    const withEvents = allDays.map((day) => ({
      day: day,
      relatedEvents: existingEvents.data?.docs.filter((event) =>
        isSameDay(event.start_date, day, { in: utc }),
      ),
    }));

    return Object.groupBy(withEvents, ({ day }) => format(day, "MMMM"));
  }, [existingEvents.data]);

  const canPublish = selectedDays.length > 0;

  return (
    <>
      <HStack
        className={cx(gutterX, divider)}
        justifyContent="end"
        height="56px"
      >
        {createEvents.error && <p>{createEvents.error.message}</p>}
        <Button
          variant="solid"
          disabled={!canPublish || createEvents.isPending}
          onClick={() => createEvents.mutate()}
        >
          Create Events
        </Button>
      </HStack>

      <VStack className={cx(gutterX, gutterY)} alignItems="start" gap="8">
        <VStack alignItems="start" gap="8">
          <h3>Filters</h3>

          <HStack>
            <div>
              <h4>Visible Dates</h4>

              <HStack className="disable-date-picker-clear">
                <VStack alignItems="start">
                  <p>Start Date</p>
                  <DatePicker
                    value={new Date(start)}
                    onChange={(value) => {
                      setStart(new UTCDate(value));
                      existingEvents.refetch();
                    }}
                    displayFormat="dd/MM/yyyy"
                    overrides={{
                      calendarStartDay: 1,
                      todayButton: "Today",
                      startDate: new Date(start),
                      endDate: new Date(end),
                      selectsStart: true,
                    }}
                  />
                </VStack>
                <VStack alignItems="start">
                  <p>End Date</p>
                  <DatePicker
                    value={new Date(end)}
                    onChange={(value) => {
                      setEnd(endOfDay(new UTCDate(value)));
                      existingEvents.refetch();
                    }}
                    displayFormat="dd/MM/yyyy"
                    overrides={{
                      calendarStartDay: 1,
                      todayButton: "Today",
                      startDate: new Date(start),
                      endDate: new Date(end),
                      selectsEnd: true,
                    }}
                  />
                </VStack>
              </HStack>
            </div>
          </HStack>
        </VStack>

        <panda.div alignSelf="stretch" className={cx(bleedX, divider)} />

        <VStack alignSelf="stretch" alignItems="stretch">
          <div>
            <panda.h3>
              Calender {existingEvents.isFetching && "(fetching events...)"}
            </panda.h3>
            <p>Select the days you want to create events for.</p>
          </div>

          {Object.keys(groupedDays).map((month) => {
            const monthOffset = groupedDays[month]?.[0]
              ? (getDay(groupedDays[month][0].day) + 6) % 7
              : 0;

            const monthOffsetAsArray = Array.from(
              { length: monthOffset },
              (_, i) => i,
            );

            return (
              <VStack
                key={month}
                alignItems="start"
                border="1px solid"
                borderColor="border.muted"
                padding="4"
              >
                <panda.h3 marginTop="8">{month}</panda.h3>

                <Grid columns={7} width="100%">
                  {daysOfWeek.map(({ name, short }) => (
                    <Center key={`day-of-week-${month}-${name}+${short}`}>
                      {short}
                    </Center>
                  ))}

                  {monthOffsetAsArray.map((i) => (
                    <Box key={`empty-${month}-${i}`} />
                  ))}

                  {groupedDays[month]?.map(({ day, relatedEvents }) => (
                    <Button
                      key={day.getTime()}
                      height="auto"
                      minHeight="150px"
                      padding="4"
                      flexDir="column"
                      justifyContent="start"
                      alignItems="start"
                      textAlign="start"
                      lineHeight="0.8"
                      variant={selectedDays.includes(day) ? "solid" : "outline"}
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day)
                            ? prev.filter((d) => d !== day)
                            : [...prev, day],
                        );
                      }}
                    >
                      <panda.p marginBottom="2">{format(day, "dd")}</panda.p>

                      {relatedEvents?.map((event) => (
                        <p
                          key={event.id}
                        >{`${format(event.start_date, "HH:mm")} ${event.title}`}</p>
                      ))}

                      {selectedDays.includes(day) && (
                        <p>
                          + New <br />
                          {`${format(props.doc.start_time, "HH:mm")} ${props.doc.event_title}`}
                        </p>
                      )}
                    </Button>
                  ))}
                </Grid>
              </VStack>
            );
          })}
        </VStack>
      </VStack>
    </>
  );
};
