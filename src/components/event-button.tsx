import type { ReactNode } from "react";
import { type BoxProps, panda, splitCssProps } from "styled-system/jsx";
import { format } from "@/utils/tz-format";

type Props = {
  onClick: () => void;
  disabled?: boolean;
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
      cursor={{ base: "pointer", _disabled: "not-allowed" }}
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
  startDate: Date | string;
  endDate: Date | string;
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

const EventButtonDescription = (props: BoxProps) => (
  <panda.div
    maxHeight={{ base: "100px", md: "78px" }}
    overflow="hidden"
    textOverflow="ellipsis"
    lineClamp={{ base: "4", md: "2" }}
    {...props}
  />
);

export const EventButton = {
  Root: EventButtonRoot,
  Time: EventButtonTime,
  DateTime: EventButtonDateTime,
  Title: EventButtonTitle,
  Description: EventButtonDescription,
};
