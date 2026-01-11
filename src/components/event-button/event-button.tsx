import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { type BoxProps, panda } from "styled-system/jsx";
import { format } from "@/utils/tz-format";

type Props = {
  children?: ReactNode;
  className?: string;
} & LinkProps;

export const Root = ({ children, className, ...props }: Props) => (
  <Link
    {...props}
    className={cx(
      css({
        backgroundColor: {
          base: "colorPalette.1",
          _dark: "colorPalette.4",
        },
        padding: "6",
        cursor: "pointer",
        textAlign: "left",
        borderRadius: "l3",
      }),
      "group",
      className,
    )}
  >
    {children}
  </Link>
);

type EventButtonDateProps = {
  startDate: Date | string;
  endDate: Date | string;
};

export const Time = ({ startDate, endDate }: EventButtonDateProps) => (
  <panda.p>
    {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
  </panda.p>
);

export const DateTime = ({
  className,
  startDate,
  endDate,
}: EventButtonDateProps & BoxProps) => {
  return (
    <panda.p className={className}>
      {format(startDate, "iiii dd MMMM")}, {format(startDate, "HH:mm")} -{" "}
      {format(endDate, "HH:mm")}
    </panda.p>
  );
};

type EventButtonTitleProps = {
  children: ReactNode;
};

export const Title = (props: EventButtonTitleProps) => (
  <h5
    className={css({
      color: "colorPalette.12",
      fontSize: "xl",
      fontWeight: "semibold",
    })}
  >
    {props.children}
  </h5>
);

type DescriptionProps = {
  children: ReactNode;
};
export const Description = (props: DescriptionProps) => (
  <panda.div
    maxHeight={{ base: "100px", md: "78px" }}
    overflow="hidden"
    textOverflow="ellipsis"
    lineClamp={{ base: "4", md: "2" }}
    {...props}
  />
);
