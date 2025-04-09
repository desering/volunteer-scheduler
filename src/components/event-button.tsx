import type { ReactNode } from "react";
import { Box, panda, splitCssProps, type BoxProps } from "styled-system/jsx";
import { format } from "@/utils/tz-format";

type Props = {
  onClick: () => void;
  children?: ReactNode;
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
      padding="6"
      cursor="pointer"
      textAlign="left"
      borderRadius="l3"
      className="group"
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
  children: ReactNode;
};
const EventButtonTitle = (props: EventButtonTitleProps) => (
  <panda.h5 color="colorPalette.12" fontSize="xl" fontWeight="semibold">
    {props.children}
  </panda.h5>
);

const EventButtonDescription = (props: BoxProps) =>
  props.dangerouslySetInnerHTML ? (
    <Box color="colorPalette.11" {...props} />
  ) : null;

export const EventButton = {
  Root: EventButtonRoot,
  Time: EventButtonTime,
  DateTime: EventButtonDateTime,
  Title: EventButtonTitle,
  Description: EventButtonDescription,
};
