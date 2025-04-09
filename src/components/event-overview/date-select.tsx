"use client";

import { useEffect, useRef } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Flex, panda } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type Props = {
  dates: {
    date: Date;
    isPublished: boolean;
    hasEvents: boolean;
  }[];

  date: Date;
  onDateSelect: (date: Date) => void;
};

export const DateSelect = (props: Props) => {
  const isSelected = (date: Date) =>
    startOfDay(date).getTime() === startOfDay(props.date).getTime();

  return (
    <Flex
      scrollbarWidth="none"
      overflow="scroll"
      gap="4"
      scrollSnapType="x mandatory"
      paddingBottom="4"
    >
      {props.dates.map((item, index) => {
        const ref = useRef<HTMLButtonElement>(null);

        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        useEffect(() => {
          if (isSelected(item.date) && ref.current) {
            ref.current.scrollIntoView({
              behavior: "instant",
              inline: "center",
              block: "nearest",
            });
          }
        }, [item.date, props.date]);

        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        useEffect(() => {
          if (isSelected(item.date) && ref.current) {
            ref.current.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        }, [props.date]);

        return (
          <Button
            key={item.date.getTime()}
            ref={ref}
            variant={
              isSelected(item.date)
                ? "solid"
                : item.hasEvents
                  ? "outline"
                  : "ghost"
            }
            disabled={!item.isPublished}
            onClick={() => props.onDateSelect(item.date)}
            display="block"
            height="auto"
            paddingY="4"
          >
            <Text size="xl">{format(item.date, "dd")}</Text>
            <Text size="sm" fontWeight="medium">
              {format(item.date, "iii")}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
};
