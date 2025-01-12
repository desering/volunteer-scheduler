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
import { UTCDate } from "@date-fns/utc";
import { useEffect, useMemo, useState } from "react";
import { css, cx } from "styled-system/css";
import { Box, Center, Grid, HStack, VStack, panda } from "styled-system/jsx";
import { getEventsInPeriod } from "../../actions";
import { Button } from "../ui/button";
import type { Event, EventTemplate } from "@payload-types";
import type { PaginatedDocs } from "payload";
import { daysOfWeek } from "./constants";
import { useCreateEvents } from "./use-create-events";

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

export const PublishEventTemplateForm = (props: { doc: EventTemplate }) => {
  const [start, setStart] = useState(startOfMonth(new UTCDate()));
  const [end, setEnd] = useState(endOfMonth(new UTCDate()));
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [shouldRefresh, setShouldRefresh] = useState(true);

  const { createEvents, isCreating, error } = useCreateEvents(
    props.doc.id,
    selectedDays,
    () => {
      setSelectedDays([]);
      setExistingEvents(undefined);
      setShouldRefresh(true);
    },
  );

  const canPublish = selectedDays.length > 0;

  const [isLoadingCreatedEvents, setIsLoadingCreatedEvents] = useState(false);
  const [existingEvents, setExistingEvents] = useState<PaginatedDocs<Event>>();

  const groupedDays = useMemo(() => {
    const allDays = eachDayOfInterval({
      start,
      end,
    });

    const withEvents = allDays.map((day) => ({
      day,
      relatedEvents: existingEvents?.docs.filter((event) =>
        isSameDay(event.start_date, day),
      ),
    }));

    const groupedByMonth = Object.groupBy(withEvents, ({ day }) =>
      format(day, "MMMM"),
    );

    return groupedByMonth;
  }, [start, end, existingEvents]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => setShouldRefresh(true), [start, end]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetch = async () => {
      console.log("fetching");
      const data = await getEventsInPeriod(start, end);

      setIsLoadingCreatedEvents(false);
      setExistingEvents(data);
    };

    if (shouldRefresh) {
      setIsLoadingCreatedEvents(true);
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
          onClick={() => createEvents()}
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
              Calender {isLoadingCreatedEvents && "(loading events...)"}
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

                <Grid columns={7} width="100%" className="panda">
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
