import type { Signup } from "@payload-types";
import { pretty, render, toPlainText } from "@react-email/render";
import type { CollectionAfterChangeHook } from "payload";
import { ShiftSignupConfirmationEmail } from "@/email/templates/signup-confirmation";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";
import { hashString } from "@/utils/hash-string";

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

  if (!event) {
    return doc;
  }

  const inviteDescription = "You're joining as a Volunteer \nDetails:";

  const htmlEmail = await pretty(
    await render(
      ShiftSignupConfirmationEmail({
        name: "Volunteer",
      }),
    ),
  );

  const plainEmail = toPlainText(htmlEmail);

  const icalEvent = createIcalEvent({
    id: await hashString(`${event.id}-${role.id}`),
    summary: "eventSummary",
    description: inviteDescription,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    location: "somewhere",
  }).toString();

  await sendEmail({
    to: "deSering@deserig.org",
    subject: "Signup Confirmation",
    text: plainEmail,
    html: htmlEmail,
    attachments: [
      {
        content: icalEvent,
        contentType: "text/calendar",
      },
    ],
  });

  return doc;
};
