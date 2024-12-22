"use client";

import { DatePicker } from "@payloadcms/ui";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { css, cx } from "styled-system/css";
import { Box, Center, Grid, HStack, VStack, panda } from "styled-system/jsx";
import { getShiftsInPeriod } from "../../actions";
import { Button } from "../ui/button";
import type { Shift, ShiftTemplate } from "@payload-types";
import type { PaginatedDocs } from "payload";
import { daysOfWeek } from "./constants";
import { useCreateShifts } from "./use-create-shifts";

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

export const PublishShiftTemplateForm = (props: { doc: ShiftTemplate }) => {
  const [start, setStart] = useState(startOfMonth(new Date()));
  const [end, setEnd] = useState(endOfMonth(new Date()));
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [shouldRefresh, setShouldRefresh] = useState(true);

  const { createShifts, isCreating, error } = useCreateShifts(
    props.doc.id,
    selectedDays,
    () => {
      setSelectedDays([]);
      setExistingShifts(undefined);
      setShouldRefresh(true);
    },
  );

  const canPublish = selectedDays.length > 0;

  const [isLoadingCreatedShifts, setIsLoadingCreatedShifts] = useState(false);
  const [existingShifts, setExistingShifts] = useState<PaginatedDocs<Shift>>();

  const groupedDays = useMemo(() => {
    const allDays = eachDayOfInterval({
      start,
      end,
    });

    const withShifts = allDays.map((day) => ({
      day,
      relatedShifts: existingShifts?.docs.filter((shift) =>
        isSameDay(shift.start_date, day),
      ),
    }));

    const groupedByMonth = Object.groupBy(withShifts, ({ day }) =>
      format(day, "MMMM"),
    );

    return groupedByMonth;
  }, [start, end, existingShifts]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => setShouldRefresh(true), [start, end]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetch = async () => {
      console.log("fetching");
      const data = await getShiftsInPeriod(start, end);

      setIsLoadingCreatedShifts(false);
      setExistingShifts(data);
    };

    if (shouldRefresh) {
      setIsLoadingCreatedShifts(true);
      setShouldRefresh(false);
      fetch();
    }
  }, [shouldRefresh]);

  return (
    <>
      <HStack
        className={cx(gutterX, divider)}
        justifyContent="end"
        height="56px"
      >
        {error && <p>{error}</p>}
        <Button
          variant="solid"
          disabled={!canPublish || isCreating}
          onClick={() => createShifts()}
        >
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
                    onChange={(value) => {
                      setStart(value);
                      setShouldRefresh(true);
                    }}
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
                    onChange={(value) => {
                      setEnd(value);
                      setShouldRefresh(true);
                    }}
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
            <panda.h3>
              Calender {isLoadingCreatedShifts && "(loading shifts...)"}
            </panda.h3>
            <p>Select the days you want to create shifts for.</p>
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

                <Grid columns={7} width="100%" className="panda">
                  {daysOfWeek.map(({ name, short }) => (
                    <Center key={`day-of-week-${month}-${name}+${short}`}>
                      {short}
                    </Center>
                  ))}

                  {monthOffsetAsArray.map((i) => (
                    <Box key={`empty-${month}-${i}`} />
                  ))}

                  {groupedDays[month]?.map(({ day, relatedShifts }) => (
                    <Button
                      key={day.getTime()}
                      alignItems="start"
                      justifyContent="start"
                      textAlign="start"
                      minHeight="150px"
                      flexDir="column"
                      lineHeight="0.8"
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
                      <panda.p marginBottom="2">{format(day, "dd")}</panda.p>

                      {relatedShifts?.map((shift) => (
                        <p
                          key={shift.id}
                        >{`${format(shift.start_date, "HH:mm")} ${shift.title}`}</p>
                      ))}

                      {selectedDays.includes(day) && (
                        <p>
                          + New <br />
                          {`${format(props.doc.start_time, "HH:mm")} ${props.doc.shift_title}`}
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
