import { format, isBefore, startOfDay } from "date-fns";
import { For, createEffect, createSelector, onMount } from "solid-js";
import { Flex, panda } from "styled-system/jsx";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

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

          const scrollTo = (behavior: ScrollBehavior) =>
            ref.scrollIntoView({
              behavior,
              inline: "center",
              block: "nearest",
            });

          onMount(() => isSelected(item.date) && scrollTo("instant"));
          createEffect(() => isSelected(item.date) && scrollTo("smooth"));

          return (
            <Button
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
        }}
      </For>
    </Flex>
  );
};
