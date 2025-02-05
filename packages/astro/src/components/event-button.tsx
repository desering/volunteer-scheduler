import type { JSX } from "astro/jsx-runtime";
import { Match, Show, Switch } from "solid-js";
import { Box, panda, splitCssProps, type BoxProps } from "styled-system/jsx";
import { format } from "~/utils/tz-format";

type Props = {
  onClick: () => void;
  children?: JSX.Element;
};
const EventButtonRoot = (props: Props & BoxProps) => {
  const [cssProps] = splitCssProps(props);
  return (
    <panda.button
      onClick={() => props.onClick()}
      backgroundColor={{
        base: "colorPalette.1",
        _dark: "colorPalette.4",
      }}
      paddingX="6"
      cursor="pointer"
      textAlign="left"
      borderRadius="l3"
      class="group"
      {...cssProps}
    >
      {props.children}
    </panda.button>
  );
};

type EventButtonDateProps = {
  startDate: Date;
  endDate: Date;
};
const EventButtonTime = (props: EventButtonDateProps) => (
  <panda.p>
    {format(props.startDate, "HH:mm")} - {format(props.endDate, "HH:mm")}
  </panda.p>
);
const EventButtonDateTime = (props: EventButtonDateProps & BoxProps) => {
  const [cssProps] = splitCssProps(props);
  return (
    <panda.p {...cssProps}>
      {format(props.startDate, "iiii dd MMMM")},{" "}
      {format(props.startDate, "HH:mm")} - {format(props.endDate, "HH:mm")}
    </panda.p>
  );
};

type EventButtonTitleProps = {
  children: JSX.Element;
};
const EventButtonTitle = (props: EventButtonTitleProps) => (
  <panda.h5 color="colorPalette.12" fontSize="xl" fontWeight="semibold">
    {props.children}
  </panda.h5>
);

const EventButtonDescription = (props: BoxProps) => (
  <Show when={props.innerHTML}>
    <Box color="colorPalette.11" {...props} />
  </Show>
);

export const EventButton = {
  Root: EventButtonRoot,
  Time: EventButtonTime,
  DateTime: EventButtonDateTime,
  Title: EventButtonTitle,
  Description: EventButtonDescription,
};
