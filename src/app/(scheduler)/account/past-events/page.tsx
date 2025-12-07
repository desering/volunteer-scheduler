"use server";

import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Container, panda } from "styled-system/jsx";
import { PastEventsList } from "@/components/past-events-list";
import { getPastEventsForUserId } from "@/lib/services/get-past-events-for-user-id";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect("/auth/sign-in");
  }

  const events = await getPastEventsForUserId(user.id);

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
        My past shifts
      </panda.h1>
      <PastEventsList initialData={events} />
    </Container>
  );
}
