import { pretty, render, toPlainText } from "@react-email/render";
import type { TaskConfig } from "payload";
import { notificationChannels } from "@/constants/notification-channels";
import { notificationTypes } from "@/constants/notification-types";
import { SignupConfirmation } from "@/email/templates/signup-confirmation";
import { buildSignupIcalEventData } from "@/lib/email/build-signup-ical-event-data";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";
import { logger } from "@/lib/logger";
import { format } from "@/utils/tz-format";

export const sendConfirmationEmailTask: TaskConfig<"send-event-signup-confirmation-email"> =
  {
    slug: "send-event-signup-confirmation-email",
    inputSchema: [
      {
        name: "signupId",
        type: "number",
        required: true,
      },
    ],

    handler: async ({ req: { payload }, input }) => {
      logger.info(
        { signupId: input.signupId },
        "Sending signup confirmation email",
      );

      const signup = await payload.findByID({
        collection: "signups",
        id: input.signupId,
        depth: 2,
      });

      if (!signup) {
        logger.error(
          { signupId: input.signupId },
          "Signup not found, cannot send confirmation email",
        );
        return { output: "skipped" };
      }

      if (
        typeof signup.user !== "object" ||
        typeof signup.role !== "object" ||
        typeof signup.event !== "object"
      ) {
        logger.error(
          { signupId: input.signupId },
          "Signup is missing related user, role, or event data, cannot send confirmation email",
        );
        return { output: "skipped" };
      }

      const eventSignupEmailPreference = await payload.count({
        collection: "user-notification-preferences",
        where: {
          user: { equals: signup.user.id },
          type: { equals: notificationTypes.EVENT_SIGNUP.key },
          channel: { equals: notificationChannels.EMAIL },
          preference: { equals: false },
        },
      });

      if (!signup.event || eventSignupEmailPreference.totalDocs === 1) {
        logger.info(
          {
            signupId: input.signupId,
            hasEvent: !!signup.event,
            optedOut: eventSignupEmailPreference.totalDocs === 1,
          },
          "Skipping signup confirmation email",
        );
        return { output: "skipped" };
      }

      const name = signup.user.preferredName
        ? signup.user.preferredName
        : "Volunteer";

      const icalData = await buildSignupIcalEventData(
        signup.event,
        signup.role,
      );

      const formattedDate = `${format(icalData.start, "iiii dd MMMM")}, ${format(icalData.start, "HH:mm")} - ${format(icalData.end, "HH:mm")}`;

      const htmlEmail = await pretty(
        await render(
          SignupConfirmation({
            name,
            eventSummary: icalData.summary,
            role: icalData.roleTitle,
            description: icalData.description,
            date: formattedDate,
            location: icalData.location,
          }),
        ),
      );
      const plainEmail = toPlainText(htmlEmail);

      const invitation = createIcalEvent(icalData).toString();

      try {
        await sendEmail({
          to: signup.user.email,
          subject: `${icalData.summary} — Signup Confirmation`,
          text: plainEmail,
          html: htmlEmail,
          attachments: [
            {
              content: invitation,
              contentType: "text/calendar",
            },
          ],
        });

        logger.info(
          { signupId: input.signupId, userId: signup.user.id },
          "Signup confirmation email sent",
        );

        return { output: "sent" };
      } catch (error) {
        logger.error(
          { error, signupId: input.signupId, userId: signup.user.id },
          "Failed to send signup confirmation email",
        );
        throw error;
      }
    },
  };
