"use client";

import { getShiftsInPeriod } from "@/actions";
import { daysOfWeek } from "@/components/publish-shift-template/constants";
import { Gutter } from "@payloadcms/ui";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { css } from "styled-system/css";
import { Box, Center, Grid, panda, VStack } from "styled-system/jsx";

const useShiftsByMonth = (start: Date, end: Date) => {
  const allDays = useMemo(
    () =>
      eachDayOfInterval({
        start,
        end,
      }),
    [start, end],
  );

  const { data: groupedByMonth } = useQuery({
    queryKey: ["calender"],
    queryFn: async () => {
      const data = await getShiftsInPeriod(start, end);

      const withShifts = allDays.map((day) => ({
        day,
        relatedShifts: data?.docs.filter((shift) =>
          isSameDay(shift.start_date, day),
        ),
      }));

      const groupedByMonth = Object.groupBy(withShifts, ({ day }) =>
        format(day, "MMMM"),
      );

      return groupedByMonth;
    },
  });

  return { groupedByMonth };
};

export const CalenderViewClient = () => {
  const [start, setStart] = useState(startOfMonth(new Date()));
  const [end, setEnd] = useState(endOfMonth(new Date()));

  const { groupedByMonth } = useShiftsByMonth(start, end);

  return (
    <Gutter>
      <h1>Calender</h1>
      <br />
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

                {groupedByMonth[month]?.map(({ day, relatedShifts }) => (
                  <VStack
                    key={day.getTime()}
                    alignItems="start"
                    justifyContent="start"
                    textAlign="start"
                    minHeight="150px"
                    flexDir="column"
                    lineHeight="0.8"
                    padding="4"
                    border="1px solid"
                    borderColor="border.muted"
                    gap="2"
                  >
                    <panda.p marginBottom="2">{format(day, "dd")}</panda.p>

                    {relatedShifts?.map((shift) => (
                      <Link
                        key={shift.id}
                        href={`/admin/collections/shifts/${shift.id}`}
                        className={css({
                          lineHeight: "1",
                          _hover: {
                            textDecoration: "underline",
                          },
                        })}
                      >{`${format(shift.start_date, "HH:mm")} ${shift.title}`}</Link>
                    ))}
                  </VStack>
                ))}
              </Grid>
            </VStack>
          );
        })}
    </Gutter>
  );
};
