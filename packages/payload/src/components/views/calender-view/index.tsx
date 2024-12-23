import { getShiftsInPeriod } from "@/actions";
import { daysOfWeek } from "@/components/publish-shift-template/constants";
import { Button } from "@/components/ui/button";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import Link from "next/link";
import type { AdminViewProps, CollectionSlug } from "payload";
import { css } from "styled-system/css";
import { Box, Center, Grid, panda, VStack } from "styled-system/jsx";

const supportedSlugs: CollectionSlug[] = ["shifts"];

export const CalenderView = async ({
  initPageResult,
  params,
  searchParams,
}: AdminViewProps) => {
  let collectionSlug: CollectionSlug | undefined = undefined;

  if (typeof params?.segments === "object") {
    const potentialSlug = params.segments[1] as CollectionSlug;

    if (supportedSlugs.includes(potentialSlug)) {
      collectionSlug = potentialSlug;
    }
  }

  if (!collectionSlug) {
    throw new Error("Unsupported collection slug");
  }

  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const data = await getShiftsInPeriod(start, end);

  const allDays = eachDayOfInterval({
    start,
    end,
  });

  const withShifts = allDays.map((day) => ({
    day,
    relatedShifts: data?.docs.filter((shift) =>
      isSameDay(shift.start_date, day),
    ),
  }));

  const groupedByMonth = Object.groupBy(withShifts, ({ day }) =>
    format(day, "MMMM"),
  );

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Calender</h1>
        <br />
        {Object.keys(groupedByMonth).map((month) => {
          const monthOffset = groupedByMonth[month]?.[0]
            ? (getDay(groupedByMonth[month][0].day) + 6) % 7
            : 0;

          const monthOffsetAsArray = Array.from(
            { length: monthOffset },
            (_, i) => i,
          );

          return (
            <VStack
              key={month}
              alignItems="start"
              border="1px solid"
              borderColor="border.muted"
              padding="4"
            >
              <panda.h3 marginTop="8">{month}</panda.h3>

              <Grid columns={7} width="100%" className="panda">
                {daysOfWeek.map(({ name, short }) => (
                  <Center key={`day-of-week-${month}-${name}+${short}`}>
                    {short}
                  </Center>
                ))}

                {monthOffsetAsArray.map((i) => (
                  <Box key={`empty-${month}-${i}`} />
                ))}

                {groupedByMonth[month]?.map(({ day, relatedShifts }) => (
                  <VStack
                    key={day.getTime()}
                    alignItems="start"
                    justifyContent="start"
                    textAlign="start"
                    minHeight="150px"
                    flexDir="column"
                    lineHeight="0.8"
                    padding="4"
                    border="1px solid"
                    borderColor="border.muted"
                    gap="2"
                  >
                    <panda.p marginBottom="2">{format(day, "dd")}</panda.p>

                    {relatedShifts?.map((shift) => (
                      <Link
                        key={shift.id}
                        href={`/admin/collections/shifts/${shift.id}`}
                        className={css({
                          lineHeight: "1",
                          _hover: {
                            textDecoration: "underline",
                          },
                        })}
                      >{`${format(shift.start_date, "HH:mm")} ${shift.title}`}</Link>
                    ))}
                  </VStack>
                ))}
              </Grid>
            </VStack>
          );
        })}
      </Gutter>
    </DefaultTemplate>
  );
};
