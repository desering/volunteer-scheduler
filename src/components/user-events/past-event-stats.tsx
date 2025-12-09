"use client";

import {
  addMonths,
  endOfToday,
  format,
  isSameMonth,
  lastDayOfMonth,
} from "date-fns";
import { Flex, HStack, panda, VStack } from "styled-system/jsx";
import { CalendarHeatmap } from "@/components/user-events/calendar-heatmap";

type PastEventStatsProps = {
  eventDates: Date[];
};

export const PastEventStats = (props: PastEventStatsProps) => {
  const totalShifts: number = props.eventDates.length;
  const thisMonthShifts: number = props.eventDates.filter((date) => {
    return isSameMonth(date, endOfToday());
  }).length;

  return (
    <HStack alignSelf="center" margin="12pt" height="200">
      <VStack marginEnd="10">
        <Flex
          direction="column"
          borderRadius="13"
          borderWidth="2"
          borderColor={{
            base: "colorPalette.2",
            _dark: "colorPalette.10/30",
          }}
          borderStyle="solid"
          height="100%"
          minWidth="160"
          padding="8pt"
        >
          <panda.p>Total shifts:</panda.p>
          <panda.b display="flex" justifyContent="end" fontSize="24pt">
            {totalShifts}
          </panda.b>
        </Flex>
        <Flex
          direction="column"
          borderRadius="13"
          borderWidth="2"
          borderColor={{
            base: "colorPalette.2",
            _dark: "colorPalette.10/30",
          }}
          borderStyle="solid"
          height="100%"
          minWidth="160"
          padding="8pt"
        >
          <panda.h1>Shifts this month:</panda.h1>
          <panda.b display="flex" justifyContent="end" fontSize="24pt">
            {thisMonthShifts}
          </panda.b>
        </Flex>
      </VStack>

      <VStack>
        <panda.h2>{format(addMonths(endOfToday(), -2), "LLLL")}</panda.h2>
        <CalendarHeatmap
          lastDate={lastDayOfMonth(addMonths(endOfToday(), -2))}
          activeDates={props.eventDates}
        />
      </VStack>

      <VStack>
        <panda.h2>{format(addMonths(endOfToday(), -1), "LLLL")}</panda.h2>
        <CalendarHeatmap
          lastDate={lastDayOfMonth(addMonths(endOfToday(), -1))}
          activeDates={props.eventDates}
        />
      </VStack>

      <VStack>
        <panda.h2>{format(endOfToday(), "LLLL")}</panda.h2>
        <CalendarHeatmap
          lastDate={endOfToday()}
          activeDates={props.eventDates}
        />
      </VStack>
    </HStack>
  );
};
