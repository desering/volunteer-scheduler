"use client";

import {
  addDays,
  addWeeks,
  isBefore,
  isSameDay,
  isSameMonth,
  previousMonday,
  startOfMonth,
} from "date-fns";
import { Box, HStack, VStack } from "styled-system/jsx";

const WEEK_DAYS: number[] = [0, 1, 2, 3, 4, 5, 6];
const MONTH_WEEKS: number[] = [0, 1, 2, 3, 4, 5];
const TILE_COLORS = {
  missing: {
    base: "colorPalette.1/20",
    _dark: "colorPalette.4/20",
  },
  innactive: {
    base: "colorPalette.1",
    _dark: "colorPalette.6",
  },
  active: {
    base: "colorPalette.7",
    _dark: "colorPalette.10",
  },
};

type CalendarHeatmapProps = {
  lastDate: Date;
  activeDates: Date[];
};

export const CalendarHeatmap = (props: CalendarHeatmapProps) => {
  const isDateActive = (date: Date) => {
    for (const activeDate of props.activeDates) {
      if (isSameDay(date, activeDate)) {
        return true;
      }
    }
    return false;
  };

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
          backgroundColor={
            isSameMonth(day, props.lastDate) && isBefore(day, props.lastDate)
              ? isDateActive(day)
                ? TILE_COLORS.active
                : TILE_COLORS.innactive
              : TILE_COLORS.missing
          }
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
