import type { Signup } from "@payload-types";
import { pretty, render, toPlainText } from "@react-email/render";
import { type CollectionAfterChangeHook } from "payload";
import { ShiftSignupConfirmationEmail } from "@/email/templates/signup-confirmation";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";

export const sendSignupConfirmationEmailHook: CollectionAfterChangeHook =
  async ({ doc }: { doc: Signup }) => {
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
      id: "eventId",
      summary: "eventSummary",
      description: inviteDescription,
      start: new Date(),
      end: new Date(),
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
