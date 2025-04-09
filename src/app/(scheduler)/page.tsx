import { headers as getHeaders } from 'next/headers.js';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {getEventsByDay} from "@/actions/get-events-by-day";
import EventOverview from "@/components/event-overview";
import NavBar from "@/components/navbar";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config })
  const { permissions, user } = await payload.auth({ headers })

  const eventsByDay = await getEventsByDay(payload);

  // const data = await fetch('https://api.vercel.app/blog')
  // const posts = await data.json()

  return (<>
    <NavBar user={user} />
    <EventOverview
        user={user}
        events={eventsByDay.data}
        flex="1"
        marginTop="4"/>
  </>);
};
