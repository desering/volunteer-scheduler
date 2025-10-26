"use client";

import { format, startOfDay } from "date-fns";
import { useEffect, useRef } from "react";
import { Flex } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type DateItem = {
  date: Date;
  isPublished: boolean;
  hasEvents: boolean;
};

type Props = {
  items: DateItem[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
};

export const DateSelect = (props: Props) => (
  <Flex
    scrollbarWidth="none"
    overflow="scroll"
    gap="4"
    scrollSnapType="x mandatory"
    paddingBottom="4"
  >
    {props.items.map((item) => (
      <DateButton
        key={item.date.getTime()}
        item={item}
        selected={
          startOfDay(item.date).getTime() ===
          startOfDay(props.selectedDate).getTime()
        }
        onDateSelect={props.onDateSelect}
      />
    ))}
  </Flex>
);

type DateButtonProps = {
  item: DateItem;
  selected: boolean;
  onDateSelect: (date: Date) => void;
};
const DateButton = ({ item, selected, onDateSelect }: DateButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({
        behavior: "instant",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selected]);

  return (
    <Button
      key={item.date.getTime()}
      ref={ref}
      variant={selected ? "solid" : item.hasEvents ? "outline" : "ghost"}
      disabled={!item.isPublished}
      onClick={() => onDateSelect(item.date)}
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
};
