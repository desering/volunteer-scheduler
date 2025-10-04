import { EventOverview } from '@/components/event-overview'
import { getEventsByDay } from '@/lib/services/get-events-by-day'
import { getUser } from '@/lib/services/get-user'

export default async function Page() {
  const { user } = await getUser()
  const eventsByDay = await getEventsByDay()

  return <EventOverview user={user ?? undefined} events={eventsByDay} flex="1" marginTop="4" />
}
