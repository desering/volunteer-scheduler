import type { JSX } from "astro/jsx-runtime";
import { Match, Show, Switch } from "solid-js";
import { Box, panda, type BoxProps } from "styled-system/jsx";
import { format } from "~/utils/tz-format";

type Props = {
  onClick: () => void;
  children?: JSX.Element;
};
const EventButtonRoot = (props: Props) => (
  <panda.button
    onClick={() => props.onClick()}
    backgroundColor={{
      base: "colorPalette.1",
      _dark: "colorPalette.4",
    }}
    paddingX="4"
    paddingY="6"
    cursor="pointer"
    textAlign="left"
    borderRadius="l3"
    class="group"
  >
    {props.children}
  </panda.button>
);

type EventButtonDateProps = {
  startDate: Date;
  endDate: Date;
};
const EventButtonTime = (props: EventButtonDateProps) => (
  <panda.p>
    {format(props.startDate, "HH:mm")} - {format(props.endDate, "HH:mm")}
  </panda.p>
);
const EventButtonDateTime = (props: EventButtonDateProps) => (
  <panda.p>
    {format(props.startDate, "iiii dd MMMM")},{" "}
    {format(props.startDate, "HH:mm")} - {format(props.endDate, "HH:mm")}
  </panda.p>
);

type EventButtonTitleProps = {
  children: JSX.Element;
};
const EventButtonTitle = (props: EventButtonTitleProps) => (
  <panda.h5 fontSize="xl" fontWeight="semibold">
    {props.children}
  </panda.h5>
);

const EventButtonDescription = (props: BoxProps) => (
  <Show when={props.innerHTML}>
    <Box color="colorPalette.3" {...props} />
  </Show>
);

export const EventButton = {
  Root: EventButtonRoot,
  Time: EventButtonTime,
  DateTime: EventButtonDateTime,
  Title: EventButtonTitle,
  Description: EventButtonDescription,
};
