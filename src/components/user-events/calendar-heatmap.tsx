"use client";

import {
  addDays,
  addWeeks,
  endOfDay,
  isBefore,
  isSameDay,
  isSameMonth,
  previousMonday,
  startOfMonth,
} from "date-fns";
import { css } from "styled-system/css";
import { Box, HStack, VStack } from "styled-system/jsx";

const WEEK_DAYS: number[] = [0, 1, 2, 3, 4, 5, 6];
const MONTH_WEEKS: number[] = [0, 1, 2, 3, 4, 5];

const tileStyles = {
  missing: css({
    bg: { base: "colorPalette.1/20", _dark: "colorPalette.4/20" },
  }),
  inactive: css({
    bg: { base: "colorPalette.1", _dark: "colorPalette.6" },
  }),
  active: css({
    bg: { base: "colorPalette.7", _dark: "colorPalette.10" },
  }),
};

type CalendarHeatmapProps = {
  lastDate: Date;
  activeDates: Date[];
};

const getDayColor = (day: Date, lastDate: Date, activeDates: Date[]) => {
  const isDateActive =
    activeDates.find((activeDate) => {
      return isSameDay(day, activeDate);
    }) !== undefined;
  const isInMonth =
    isBefore(day, endOfDay(lastDate)) && isSameMonth(day, lastDate);
  if (!isInMonth) {
    return tileStyles.missing;
  }
  if (isDateActive) {
    return tileStyles.active;
  }
  return tileStyles.inactive;
};

export const CalendarHeatmap = (props: CalendarHeatmapProps) => {
  const firstMonday: Date = previousMonday(startOfMonth(props.lastDate));

  const weeks = MONTH_WEEKS.map((w) => {
    const monday = addWeeks(firstMonday, w);

    const days = WEEK_DAYS.map((d) => {
      const day = addDays(monday, d);
      return (
        <Box
          key={d}
          width="10pt"
          height="10pt"
          borderRadius="2pt"
          className={getDayColor(day, props.lastDate, props.activeDates)}
        />
      );
    });

    return (
      <HStack key={w} gap="4pt">
        {days}
      </HStack>
    );
  });

  return (
    <VStack gap="4pt" margin="12pt">
      {weeks}
    </VStack>
  );
};
