import type { Signup } from "@payload-types";
import { pretty, render, toPlainText } from "@react-email/render";
import type { CollectionAfterChangeHook } from "payload";
import { notificationChannels } from "@/constants/notification-channels";
import { notificationTypes } from "@/constants/notification-types";
import { SignupConfirmation } from "@/email/templates/signup-confirmation";
import { buildSignupIcalEventData } from "@/lib/email/build-signup-ical-event-data";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";
import { format } from "@/utils/tz-format";

export const sendConfirmationEmail: CollectionAfterChangeHook<Signup> = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation !== "create") {
    return doc;
  }

  const eventId = typeof doc.event === "number" ? doc.event : doc.event?.id;
  if (!eventId) return doc;
  const event = await payload.findByID({
    collection: "events",
    id: eventId,
    depth: 1,
  });

  const role =
    typeof doc.role === "number"
      ? await payload.findByID({ collection: "roles", id: doc.role })
      : doc.role;

  const user =
    typeof doc.user === "number"
      ? await payload.findByID({ collection: "users", id: doc.user })
      : doc.user;

  const eventSignupEmailPreference = await payload.count({
    collection: "user-notification-preferences",
    where: {
      user: { equals: user.id },
      type: { equals: notificationTypes.EVENT_SIGNUP.key },
      channel: { equals: notificationChannels.EMAIL },
      preference: { equals: false },
    },
  });

  if (!event || eventSignupEmailPreference.totalDocs === 1) {
    return doc;
  }

  const name = user.preferredName ? user.preferredName : "Volunteer";
  const roleTitle = typeof role === "object" ? role?.title : "Volunteer";

  const icalData = await buildSignupIcalEventData(event, {
    id: role.id,
    title: roleTitle,
  });

  const formattedDate = `${format(icalData.start, "iiii dd MMMM")}, ${format(icalData.start, "HH:mm")} - ${format(icalData.end, "HH:mm")}`;

  const htmlEmail = await pretty(
    await render(
      SignupConfirmation({
        name,
        eventSummary: icalData.summary,
        role: roleTitle,
        description: icalData.description,
        date: formattedDate,
      }),
    ),
  );
  const plainEmail = toPlainText(htmlEmail);

  const invitation = createIcalEvent(icalData).toString();

  await sendEmail({
    to: user.email,
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

  return doc;
};
