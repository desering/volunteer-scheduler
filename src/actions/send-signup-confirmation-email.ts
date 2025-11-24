"use server";

import { format } from "@/utils/tz-format";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { pretty, render, toPlainText } from "@react-email/render";
import { ShiftSignupConfirmationEmail } from "@/email/templates/ShiftSignupConfirmationEmail";
import { createCalendarInvite } from "@/lib/email/create-calendar-invite";
import { sendEmail } from "@/lib/email/send-email";

export type SendSignupConfirmationParams = {
  to: string;
  name: string;
  eventSummary: string;
  description: object;
  start: string | Date;
  end: string | Date;
  location: string;
  role: string;
};

export const sendSignupConfirmationEmail = async (
  payload: SendSignupConfirmationParams,
) => {
  const { to, name, eventSummary, description, start, end, location, role } =
    payload;

  const descriptionText = convertLexicalToPlaintext({
    data: description as SerializedEditorState,
  });

  const inviteDescription = `You're joining as: ${role} \nDetails:\n ${descriptionText}`;

  const formattedDate = `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

  const htmlEmail = await pretty(
    await render(
      ShiftSignupConfirmationEmail({
        name,
        eventSummary,
        role,
        description: descriptionText,
        date: formattedDate,
      }),
    ),
  );
  const plainEmail = toPlainText(htmlEmail);

  const invitation = createCalendarInvite({
    summary: eventSummary,
    description: inviteDescription,
    start,
    end,
    location,
  }).toString();

  return await sendEmail({
    to,
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
};
