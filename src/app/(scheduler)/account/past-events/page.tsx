"use server";

import config from "@payload-config";
import { parseISO } from "date-fns";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Container, panda } from "styled-system/jsx";
import { PastEventStats } from "@/components/user-events/past-event-stats";
import { UserEventsList } from "@/components/user-events/user-events-list";
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
      <PastEventStats eventDates={eventDates} />
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
