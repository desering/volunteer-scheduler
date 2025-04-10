import { Container, panda } from "styled-system/jsx";
import { UpcomingEventsList } from "@/components/upcoming-events-list";
import {headers as getHeaders} from "next/headers";
import {getPayload} from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";
import {getUpcomingEventsForCurrentUser} from "@/lib/services/get-upcoming-events-for-current-user";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({config});
  const { user } = await payload.auth({headers});

  if (!user) {
    redirect("/auth/login");
  }

  const events = await getUpcomingEventsForCurrentUser();

  return (<>
      <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
        <panda.h1 fontSize="xl" fontWeight="medium">My upcoming shifts</panda.h1>
      </Container>
      <UpcomingEventsList user={user} data={events} />
    </>
  );
}
