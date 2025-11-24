"use server";

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

  const inviteDescription = `You're joining as: ${role} \n
    Details: ${convertLexicalToPlaintext({ data: description as SerializedEditorState })}`;

    const htmlEmail = await pretty(
    await render(ShiftSignupConfirmationEmail({ name, eventSummary, role })),
  );
  const plainEmail = toPlainText(htmlEmail);

  return await sendEmail({
    to,
    subject: `${eventSummary} — Signup Confirmation`,
    text: plainEmail,
    html: htmlEmail,
    attachments: [
      {
        content: createCalendarInvite({
          summary: eventSummary,
          description: inviteDescription,
          start,
          end,
          location,
        }).toString(),
        contentType: "text/calendar",
      },
    ],
  });
};
