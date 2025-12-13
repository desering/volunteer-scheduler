import { format, startOfDay } from "date-fns";
import { useEffect, useRef } from "react";
import { Grid, GridItem } from "styled-system/jsx";
import { token } from "styled-system/tokens";
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
  <Grid
    scrollbarWidth="none"
    overflow="scroll"
    scrollSnapType="x mandatory"
    columnGap="4"
    gridTemplateRows="auto 1fr"
    gridAutoFlow="column"
    paddingBottom="4"
    position="relative"
  >
    {props.items.map((item, index) => (
      <DateButton
        key={item.date.getTime()}
        item={item}
        itemIndex={index}
        selected={
          startOfDay(item.date).getTime() ===
          startOfDay(props.selectedDate).getTime()
        }
        onDateSelect={props.onDateSelect}
      />
    ))}
  </Grid>
);

type DateButtonProps = {
  item: DateItem;
  itemIndex: number;
  selected: boolean;
  onDateSelect: (date: Date) => void;
};
const DateButton = ({
  item,
  itemIndex,
  selected,
  onDateSelect,
}: DateButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const isFirstOfMonth = item.date.getDate() === 1;
  const isFirstItem = itemIndex === 0;
  const showMonthLabel = isFirstOfMonth || isFirstItem;

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selected]);

  return (
    <>
      {showMonthLabel && (
        <GridItem
          background={{ base: "gray.4", _dark: "gray.2" }}
          colSpan={4}
          gridRow="1"
          left="0"
          paddingInline="4"
          marginBlockEnd="4"
          position="sticky"
          zIndex="1"
          maskImage={`linear-gradient(to right, transparent 0px, ${token("colors.bg.canvas")} 16px)`}
        >
          <Text>{format(item.date, "MMMM yyyy")}</Text>
        </GridItem>
      )}

      <GridItem gridRow="2">
        <Button
          key={item.date.getTime()}
          ref={ref}
          variant={selected ? "solid" : item.hasEvents ? "outline" : "ghost"}
          disabled={!item.isPublished}
          onClick={() => onDateSelect(item.date)}
          display="block"
          height="auto"
          paddingY="4"
          aria-label={`Select ${format(item.date, "EEEE MMMM d, yyyy")}`}
        >
          <Text size="xl">{format(item.date, "dd")}</Text>
          <Text size="sm" fontWeight="medium">
            {format(item.date, "iii")}
          </Text>
        </Button>
      </GridItem>
    </>
  );
};
