import type { Signup } from "@payload-types";
import { pretty, render, toPlainText } from "@react-email/render";
import { addHours } from "date-fns";
import type { CollectionAfterChangeHook } from "payload";
import { ShiftSignupConfirmationEmail } from "@/email/templates/ShiftSignupConfirmationEmail";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";

export const sendSignupConfirmationEmailHook: CollectionAfterChangeHook =
  async ({ doc }: { doc: Signup }) => {
    const start = addHours(new Date(), 2);
    start.setMinutes(0);
    const end = addHours(new Date(), 3);
    end.setMinutes(0);

    const icalEvent = createIcalEvent({
      summary: "Tuesday Evening First Shift",
      description: "You'll be doing stuff in this shift. Lets go team!",
      start: start,
      end: end,
      location: "De Sering, Rhoneweg 6, 1043 AH Amsterdam",
    });

    const htmlEmail = await pretty(
      await render(ShiftSignupConfirmationEmail({ name: "Bernhard" })),
    );
    const plainEmail = toPlainText(htmlEmail);

    await sendEmail({
      to: "frickb95@gmail.com",
      subject: "Shift Signup Confirmation",
      text: plainEmail,
      html: htmlEmail,
      attachments: [
        {
          content: icalEvent.toString(),
          contentType: "text/calendar",
        },
      ],
    });

    return doc;
  };
