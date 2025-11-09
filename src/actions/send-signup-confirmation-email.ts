"use server";

import { pretty, render, toPlainText } from "@react-email/render";
import { addHours } from "date-fns";
import { ShiftSignupConfirmationEmail } from "@/email/templates/ShiftSignupConfirmationEmail";
import { createCalendarInvite } from "@/lib/email/create-calendar-invite";
import { sendEmail } from "@/lib/email/send-email";

export const sendSignupConfirmationEmail = async () => {
  const start = addHours(new Date(), 1);
  const end = addHours(new Date(), 2);

  const invite = createCalendarInvite({
    summary: "Tuesday Evening First Shift",
    description: "plain event description",
    start: start,
    end: end,
    location: "De Sering, Rhoneweg 6, 1043 AH Amsterdam",
  });

  const htmlEmail = await pretty(
    await render(ShiftSignupConfirmationEmail({ name: "Bernhard" })),
  );
  const plainEmail = toPlainText(htmlEmail);

  return await sendEmail({
    to: "frickb95@gmail.com",
    subject: "Shift Signup Confirmation",
    text: plainEmail,
    html: htmlEmail,
    attachments: [
      {
        content: invite.toString(),
        contentType: "text/calendar",
      },
    ],
  });
};
