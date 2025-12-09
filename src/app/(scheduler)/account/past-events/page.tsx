"use server";

import config from "@payload-config";
import {
  addMonths,
  endOfToday,
  format,
  lastDayOfMonth,
  parseISO,
} from "date-fns";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Container, HStack, panda, VStack } from "styled-system/jsx";
import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { UserEventsList } from "@/components/user-events-list";
import { getPastEventsForUserId } from "@/lib/services/get-past-events-for-user-id";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect("/auth/sign-in");
  }

  const events = await getPastEventsForUserId(user.id);
  const eventDates = events?.events.map((event) => {
    return parseISO(event.start_date);
  });

  return (
    <Container
      alignItems="stretch"
      display="flex"
      flexDirection="column"
      width="full"
      marginTop={{ base: 4, md: 10, xl: 20 }}
    >
      <panda.h1 fontSize="xl" fontWeight="medium" textAlign="center">
        Stats
      </panda.h1>
      <HStack alignSelf="center" margin="8pt">
        <VStack>
          <panda.h2>{format(addMonths(endOfToday(), -2), "LLLL")}</panda.h2>
          <CalendarHeatmap
            lastDate={lastDayOfMonth(addMonths(endOfToday(), -2))}
            activeDates={eventDates}
          />
        </VStack>
        <VStack>
          <panda.h2>{format(addMonths(endOfToday(), -1), "LLLL")}</panda.h2>
          <CalendarHeatmap
            lastDate={lastDayOfMonth(addMonths(endOfToday(), -1))}
            activeDates={eventDates}
          />
        </VStack>
        <VStack>
          <panda.h2>{format(endOfToday(), "LLLL")}</panda.h2>
          <CalendarHeatmap lastDate={endOfToday()} activeDates={eventDates} />
        </VStack>
      </HStack>
      <panda.h1
        fontSize="xl"
        fontWeight="medium"
        marginBottom="4"
        textAlign="center"
      >
        My past shifts
      </panda.h1>
      <UserEventsList
        initialData={events}
        refetchUrl={`/api/events/users/past`}
      />
    </Container>
  );
}
