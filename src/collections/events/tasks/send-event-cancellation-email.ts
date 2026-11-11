import { pretty, render, toPlainText } from "@react-email/render";
import type { TaskConfig } from "payload";
import { notificationChannels } from "@/constants/notification-channels";
import { notificationTypes } from "@/constants/notification-types";
import { EventCancellation } from "@/email/templates/event-cancellation";
import { sendEmail } from "@/lib/email/send-email";
import { logger } from "@/lib/logger";
import { format } from "@/utils/tz-format";

export const sendCancellationEmailTask: TaskConfig<"send-event-cancellation-email"> =
  {
    slug: "send-event-cancellation-email",
    inputSchema: [
      { name: "userId", type: "number", required: true },
      { name: "eventTitle", type: "text", required: true },
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true },
    ],

    handler: async ({ req: { payload }, input }) => {
      logger.info({ userId: input.userId }, "Sending event cancellation email");

      const user = await payload.findByID({
        collection: "users",
        id: input.userId,
        disableErrors: true,
      });

      if (!user) {
        logger.error(
          { userId: input.userId },
          "User not found, cannot send event cancellation email",
        );
        return { output: "skipped" };
      }

      const optedOut = await payload.count({
        collection: "user-notification-preferences",
        where: {
          user: { equals: user.id },
          type: { equals: notificationTypes.EVENT_CANCELLATION.key },
          channel: { equals: notificationChannels.EMAIL },
          preference: { equals: false },
        },
      });

      if (optedOut.totalDocs > 0) {
        logger.info(
          { userId: user.id },
          "User opted out, skipping event cancellation email",
        );
        return { output: "skipped" };
      }

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const formattedDate = `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

      const htmlEmail = await pretty(
        await render(
          EventCancellation({
            name: user.preferredName ? user.preferredName : "Volunteer",
            eventSummary: input.eventTitle,
            date: formattedDate,
          }),
        ),
      );

      try {
        await sendEmail({
          to: user.email,
          subject: `${input.eventTitle} — Event Cancelled`,
          text: toPlainText(htmlEmail),
          html: htmlEmail,
        });

        logger.info({ userId: user.id }, "Event cancellation email sent");

        return { output: "sent" };
      } catch (error) {
        logger.error(
          { error, userId: user.id },
          "Failed to send event cancellation email",
        );
        throw error;
      }
    },
  };
