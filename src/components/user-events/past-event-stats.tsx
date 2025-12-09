"use client";

import { addMonths, endOfToday, format, lastDayOfMonth } from "date-fns";
import { HStack, panda, VStack } from "styled-system/jsx";
import { CalendarHeatmap } from "@/components/user-events/calendar-heatmap";

type PastEventStatsProps = {
  eventDates: Date[];
};

export const PastEventStats = (props: PastEventStatsProps) => {
  return (
    <HStack alignSelf="center" margin="8pt">
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
