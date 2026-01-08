import type { Signup } from "@payload-types";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { pretty, render, toPlainText } from "@react-email/render";
import type { CollectionAfterChangeHook } from "payload";
import { notificationChannels } from "@/constants/notification-channels";
import { notificationTypes } from "@/constants/notification-types";
import { SignupConfirmation } from "@/email/templates/signup-confirmation";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";
import { hashString } from "@/utils/hash-string";
import { format } from "@/utils/tz-format";

export const sendConfirmationEmail: CollectionAfterChangeHook<Signup> = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation !== "create") {
    return doc;
  }

  const event =
    typeof doc.event === "number"
      ? await payload.findByID({ collection: "events", id: doc.event })
      : doc.event;

  const role =
    typeof doc.role === "number"
      ? await payload.findByID({ collection: "roles", id: doc.role })
      : doc.role;

  const user =
    typeof doc.user === "number"
      ? await payload.findByID({ collection: "users", id: doc.user })
      : doc.user;

  const eventSignupEmailPreference = await payload.find({
    collection: "user-notification-preferences",
    where: {
      user: { equals: user.id },
      type: { equals: notificationTypes.EVENT_SIGNUP },
      channel: { equals: notificationChannels.EMAIL },
    },
  });

  if (
    !event ||
    eventSignupEmailPreference.docs.length === 0 ||
    eventSignupEmailPreference.docs[0].preference !== true
  ) {
    return doc;
  }

  const name = user.preferredName ? user.preferredName : "Volunteer";
  const eventSummary = event.title ?? "Volunteer Shift";
  const description = event.description ?? undefined;
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const location = process.env.ORG_ADDRESS || "Event Location";
  const roleTitle = typeof role === "object" ? role?.title : "Volunteer";

  const descriptionText = convertLexicalToPlaintext({
    data: description as SerializedEditorState,
  });

  const inviteDescription = `You're joining as: ${roleTitle} \nDetails:\n ${descriptionText}`;

  const formattedDate = `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

  const htmlEmail = await pretty(
    await render(
      SignupConfirmation({
        name,
        eventSummary,
        role: roleTitle,
        description: descriptionText,
        date: formattedDate,
      }),
    ),
  );
  const plainEmail = toPlainText(htmlEmail);

  const invitation = createIcalEvent({
    id: await hashString(`${event.id}-${role.id}`),
    summary: eventSummary,
    description: inviteDescription,
    start,
    end,
    location,
  }).toString();

  await sendEmail({
    to: user.email,
    subject: `${eventSummary} — Signup Confirmation`,
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
