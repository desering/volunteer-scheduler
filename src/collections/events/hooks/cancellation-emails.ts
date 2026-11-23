import type {
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
} from "payload";
import { logger } from "@/lib/logger";

type CancellationRecipients = { userIds: number[] };

const contextKeyFor = (eventId: number | string) =>
  `cancellationRecipients:${eventId}`;

// Signups lose their event reference once the event is gone, so attendees have to be read beforehand
export const collectCancellationRecipients: CollectionBeforeDeleteHook =
  async ({ id, req }) => {
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

    const userIds = [
      ...new Set(signups.docs.map((signup) => signup.user as number)),
    ];

    req.context[contextKeyFor(id)] = {
      userIds,
    } satisfies CancellationRecipients;
  };

export const queueCancellationEmails: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const recipients = req.context[contextKeyFor(doc.id)] as
    | CancellationRecipients
    | undefined;

  for (const userId of recipients?.userIds ?? []) {
    try {
      await req.payload.jobs.queue({
        task: "send-event-cancellation-email",
        input: {
          userId,
          eventTitle: doc.title,
          startDate: doc.start_date,
          endDate: doc.end_date,
        },
      });
    } catch (error) {
      logger.error(
        { userId, eventId: doc.id, error },
        "Failed to queue event cancellation email job",
      );
    }
  }

  return doc;
};
