"use server";

import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Container, panda } from "styled-system/jsx";
import { UserEventsList } from "@/components/user-events/user-events-list";
import { getUpcomingEventsForUserId } from "@/lib/services/get-upcoming-events-for-user-id";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect("/auth/sign-in");
  }

  const events = await getUpcomingEventsForUserId(user.id, {
    sort: ["event.start_date"],
  });

  return (
    <Container
      alignItems="stretch"
      display="flex"
      flexDirection="column"
      width="full"
      marginTop={{ base: 4, md: 10, xl: 20 }}
    >
      <panda.h1
        fontSize="xl"
        fontWeight="medium"
        marginBottom="4"
        textAlign="center"
      >
        My upcoming shifts
      </panda.h1>
      <UserEventsList
        initialData={events}
        refetchUrl={`/api/events/users/upcoming`}
        filterOptions={{ sort: ["event.start_date"] }}
      />
    </Container>
  );
}
