import { getUpcomingEventsForUserId } from '@/lib/services/get-upcoming-events-for-user-id'
import { getUser } from '@/lib/services/get-user'

export const GET = async () => {
  const { user } = await getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const events = getUpcomingEventsForUserId(user.id)

  return new Response(JSON.stringify(events), { status: 200 })
}
