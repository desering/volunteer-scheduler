"use client";

import { UTCDate, utc } from "@date-fns/utc";
import { DatePicker } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  format,
  getDay,
  isSameDay,
} from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { css, cx } from "../../../styled-system/css";
import {
  Box,
  Center,
  Flex,
  Grid,
  HStack,
  panda,
  VStack,
} from "../../../styled-system/jsx";
import { bleedX, divider, gutterX, gutterY } from "@/components/ui/utils";
import { daysOfWeek } from "@/constants/days-of-week";
import { getEventsInPeriod } from "@/lib/services/get-events-in-period";
import { endOfMonth, startOfMonth } from "@/utils/utc";

const useEventsByMonth = (start: Date, end: Date) => {
  const allDays = useMemo(
    () =>
      eachDayOfInterval({
        start,
        end,
      }),
    [start, end],
  );

  const { data: groupedByMonth } = useQuery({
    queryKey: ["calendar", start, end],
    queryFn: async () => {
      const data = await getEventsInPeriod(start, end);

      const withEvents = allDays.map((day) => ({
        day,
        relatedEvents: data?.docs.filter((event) =>
          isSameDay(event.start_date, day),
        ),
      }));

      return Object.groupBy(withEvents, ({ day }) => format(day, "MMMM"));
    },
    refetchOnMount: "always",
  });

  return { groupedByMonth };
};

export const CalendarViewClient = () => {
  const [start, setStart] = useState(startOfMonth(new UTCDate()));
  const [end, setEnd] = useState(endOfMonth(addMonths(new UTCDate(), 2)));

  const { groupedByMonth } = useEventsByMonth(start, end);

  return (
    <VStack className={cx(gutterX, gutterY)} alignItems="start" gap="8">
      <panda.div alignSelf="stretch" className={cx(bleedX, divider)} />

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
                  }}
                  displayFormat="dd/MM/yyyy"
                  overrides={{
                    calendarStartDay: 1,
                    todayButton: "Today",
                    startDate: new Date(start),
                    endDate: new Date(end),
                    selectsStart: true,
                  }}
                  maxDate={end}
                />
              </VStack>
              <VStack alignItems="start">
                <p>End Date</p>
                <DatePicker
                  value={new Date(end)}
                  onChange={(value) => {
                    setEnd(endOfDay(new UTCDate(value), { in: utc }));
                  }}
                  displayFormat="dd/MM/yyyy"
                  overrides={{
                    calendarStartDay: 1,
                    todayButton: "Today",
                    startDate: new Date(start),
                    endDate: new Date(end),
                    selectsEnd: true,
                  }}
                  minDate={start}
                />
              </VStack>
            </HStack>
          </div>
        </HStack>
      </VStack>

      <panda.div alignSelf="stretch" className={cx(bleedX, divider)} />

      <h1>Calendar</h1>

      {groupedByMonth &&
        Object.keys(groupedByMonth).map((month) => {
          const monthOffset = groupedByMonth[month]?.[0]
            ? (getDay(groupedByMonth[month][0].day) + 6) % 7
            : 0;

          const monthOffsetAsArray = Array.from(
            { length: monthOffset },
            (_, i) => i,
          );

          return (
            <VStack
              key={month}
              alignItems="start"
              alignSelf="stretch"
              border="1px solid"
              borderColor="border.muted"
              padding="4"
            >
              <panda.h3 marginTop="8">{month}</panda.h3>

              <Grid columns={7} width="100%" className="panda">
                {daysOfWeek.map(({ name, short }) => (
                  <Center key={`day-of-week-${month}-${name}+${short}`}>
                    {short}
                  </Center>
                ))}

                {monthOffsetAsArray.map((i) => (
                  <Box key={`empty-${month}-${i}`} />
                ))}

                {groupedByMonth[month]?.map(({ day, relatedEvents }) => (
                  <Flex
                    key={day.getTime()}
                    minHeight="150px"
                    padding="4"
                    flexDirection="column"
                    gap="2"
                    lineHeight="0.8"
                    border="1px solid"
                    borderColor="border.muted"
                  >
                    <panda.p marginBottom="2">{format(day, "dd")}</panda.p>

                    {relatedEvents?.map((event) => (
                      <Link
                        key={event.id}
                        href={`/admin/collections/events/${event.id}`}
                        className={css({
                          lineHeight: "1",
                          _hover: {
                            textDecoration: "underline",
                          },
                        })}
                      >{`${format(event.start_date, "HH:mm")} ${event.title}`}</Link>
                    ))}
                  </Flex>
                ))}
              </Grid>
            </VStack>
          );
        })}
    </VStack>
  );
};
