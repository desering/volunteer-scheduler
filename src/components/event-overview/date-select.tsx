import { format, startOfDay } from "date-fns";
import { useEffect, useRef } from "react";
import { Box, Grid, GridItem, panda } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type DateItem = {
  date: Date;
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

// compute the inline start offset needed to align the sticky month with a centered max-width container
// (viewport − minimum(viewport, containerMaxWidth)) / numberOfMarg`inAuto − paddingInline
const containerInlineStartAlignment = `((100vw - min(100vw, ${token("sizes.8xl")})) / 2)`;

const ContainerAlignedGridItem = panda(GridItem, {
  base: {
    "--bg-color": { base: "colors.gray.4", _dark: "colors.gray.2" },

    position: "sticky",
    overflow: "visible",
    zIndex: "1",
    width: "0",
    gridRow: "1",

    _before: {
      display: "block",
      position: "absolute",
      content: '""',
      backgroundImage: `linear-gradient(to right, transparent 0px, var(--bg-color) ${token("spacing.4")})`,
      left: "-8",
      width: "8",
      height: "full",
    },

    // align with container
    insetInlineStart: `calc(${containerInlineStartAlignment} + var(--inset-inline-start-offset))`,
    "--inset-inline-start-offset": {
      base: `spacing.4`,
      md: `spacing.6`,
      lg: `spacing.8`,
    },
  },
});

const ContainerAlignedGridItemInner = panda(Box, {
  base: {
    background: "var(--bg-color)",
    whiteSpace: "nowrap",
    width: "[250px]",
  },
});

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
        <ContainerAlignedGridItem aria-hidden="true">
          <ContainerAlignedGridItemInner>
            {format(item.date, "MMMM yyyy")}
          </ContainerAlignedGridItemInner>
        </ContainerAlignedGridItem>
      )}

      <GridItem gridRow="2">
        <Button
          key={item.date.getTime()}
          ref={ref}
          variant={selected ? "solid" : item.hasEvents ? "outline" : "ghost"}
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
