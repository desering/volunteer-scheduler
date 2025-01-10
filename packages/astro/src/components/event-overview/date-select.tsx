import { format, isBefore, startOfDay } from "date-fns";
import { For, createEffect, createSelector } from "solid-js";
import { Flex, panda } from "styled-system/jsx";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

type Props = {
  dates: {
    date: Date;
    hasEvents: boolean;
  }[];

  date: Date;
  onDateSelect: (date: Date) => void;
};

export const DateSelect = (props: Props) => {
  const isSelected = createSelector(
    () => props.date,
    (a, b) => a.getTime() === b.getTime(),
  );

  return (
    <Flex
      scrollbarWidth="none"
      overflow="scroll"
      gap="4"
      scrollSnapType="x mandatory"
      paddingBottom="4"
    >
      <For each={props.dates}>
        {(item) => {
          let ref!: HTMLButtonElement;

          createEffect(() => {
            if (!isSelected(item.date)) return;

            ref.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          });

          return (
            <Button
              ref={ref}
              variant={
                isSelected(item.date)
                  ? "solid"
                  : isBefore(item.date, startOfDay(new Date()))
                    ? "ghost"
                    : item.hasEvents
                      ? "outline"
                      : "ghost"
              }
              disabled={isBefore(item.date, startOfDay(new Date()))}
              onClick={() => props.onDateSelect(item.date)}
              display="block"
              height="auto"
              paddingY="4"
              // fontWeight="unset"
            >
              <Text size="xl">{format(item.date, "dd")}</Text>
              <Text size="sm" fontWeight="medium">
                {format(item.date, "iii")}
              </Text>
            </Button>
          );
        }}
      </For>
    </Flex>
  );
};
