"use client";

import { DatePicker, useServerFunctions } from "@payloadcms/ui";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { css, cx } from "styled-system/css";
import { Box, Grid, HStack, VStack, panda } from "styled-system/jsx";
import { Button } from "./ui/button";
import { getShiftsInPeriod } from "./actions";

const gutterX = css({
  paddingX: "60px",
});

const bleedX = css({
  marginX: "-60px",
});

const gutterY = css({ paddingTop: "30px", paddingBottom: "60px" });

const divider = css({
  borderBottom: "1px solid",
  borderBottomColor: "border.muted",
});

export const PublishShiftTemplate = (props) => {
  console.log(props);
  const [start, setStart] = useState(startOfMonth(new Date()));
  const [end, setEnd] = useState(endOfMonth(new Date()));
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  const canPublish = selectedDays.length > 0;

  const groupedDays = useMemo(() => {
    const allDays = eachDayOfInterval({
      start,
      end,
    });

    const groupedByMonth = Object.groupBy(allDays, (day) =>
      format(day, "MMMM"),
    );

    return groupedByMonth;
  }, [start, end]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getShiftsInPeriod(start, end);
      console.log(data);
    };
    fetch();
  }, [start, end]);

  return (
    <>
      <HStack
        className={cx(gutterX, divider)}
        justifyContent="end"
        height="56px"
      >
        <Button variant="solid" disabled={!canPublish}>
          Create Shifts
        </Button>
      </HStack>

      <VStack className={cx(gutterX, gutterY)} alignItems="start" gap="8">
        <VStack alignItems="start" gap="8">
          <h3>Filters</h3>

          <HStack>
            <div>
              <h4>Visible Dates</h4>

              <HStack>
                <VStack alignItems="start">
                  <p>Start Date</p>
                  <DatePicker
                    value={start}
                    onChange={(value) => setStart(value)}
                    displayFormat="dd/MM/yyyy"
                    overrides={{
                      calendarStartDay: 1,
                    }}
                  />
                </VStack>
                <VStack alignItems="start">
                  <p>End Date</p>
                  <DatePicker
                    value={end}
                    onChange={(value) => setEnd(value)}
                    displayFormat="dd/MM/yyyy"
                    overrides={{
                      calendarStartDay: 1,
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
            <panda.h3>Calender</panda.h3>
            <p>Select the days you want to create shifts for.</p>
          </div>

          {Object.keys(groupedDays).map((month) => {
            const monthOffset = groupedDays[month]?.[0]
              ? (getDay(groupedDays[month][0]) + 6) % 7
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
                  {monthOffsetAsArray.map((i) => (
                    <Box key={`${month}-${i}`} />
                  ))}

                  {groupedDays[month]?.map((day) => (
                    <Button
                      key={day.getTime()}
                      alignItems="start"
                      justifyContent="start"
                      minHeight="150px"
                      flexDir="column"
                      padding="4"
                      variant={selectedDays.includes(day) ? "solid" : "outline"}
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day)
                            ? prev.filter((d) => d !== day)
                            : [...prev, day],
                        );
                      }}
                    >
                      <p>{format(day, "dd")}</p>
                      <p>{selectedDays.includes(day) && "Selected"}</p>
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
