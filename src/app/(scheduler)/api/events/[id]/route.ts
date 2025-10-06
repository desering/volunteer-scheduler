import { getEventDetails } from '@/lib/services/get-event-details'

export async function GET(_request: Request, ctx: RouteContext<'/api/events/[id]'>) {
  const { id } = await ctx.params

  const eventId = Number(id)
  if (Number.isNaN(eventId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  return Response.json(await getEventDetails(eventId))
}
