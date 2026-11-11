import type { CollectionBeforeDeleteHook } from "payload";
import { logger } from "@/lib/logger";

// Queued before the delete on purpose: a click on delete means the event is cancelled, so attendees are told even if the delete itself fails
export const queueCancellationEmails: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const event = await req.payload.findByID({
    collection: "events",
    id,
    depth: 0,
    disableErrors: true,
  });

  if (!event || new Date(event.end_date) < new Date()) {
    return;
  }

  const signups = await req.payload.find({
    collection: "signups",
    where: { event: { equals: id } },
    depth: 0,
    pagination: false,
    select: { user: true },
  });

  const userIds = new Set(signups.docs.map((signup) => signup.user as number));

  for (const userId of userIds) {
    try {
      await req.payload.jobs.queue({
        task: "send-event-cancellation-email",
        input: {
          userId,
          eventTitle: event.title,
          startDate: event.start_date,
          endDate: event.end_date,
        },
      });
    } catch (error) {
      logger.error(
        { userId, eventId: id, error },
        "Failed to queue event cancellation email job",
      );
    }
  }
};
