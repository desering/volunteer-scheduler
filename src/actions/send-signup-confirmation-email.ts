"use server";

import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { pretty, render, toPlainText } from "@react-email/render";
import { addHours } from "date-fns";
import { ShiftSignupConfirmationEmail } from "@/email/templates/ShiftSignupConfirmationEmail";
import { createCalendarInvite } from "@/lib/email/create-calendar-invite";
import { sendEmail } from "@/lib/email/send-email";

export type SendSignupConfirmationPayload = {
  to: string;
  name: string;
  eventSummary: string;
  description?: object;
  start: string | Date;
  end: string | Date;
  location: string;
  role: string;
};

export const sendSignupConfirmationEmail = async (
  payload: SendSignupConfirmationPayload,
) => {
  const { to, name, eventSummary, description, start, end, location, role } =
    payload;

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
        content: createInvite({
          eventSummary,
          role,
          description,
          start,
          end,
          location,
        }).toString(),
        contentType: "text/calendar",
      },
    ],
  });
};

const createInvite = ({
  eventSummary,
  role,
  description,
  start,
  end,
  location,
}: {
  eventSummary: string;
  role: string;
  description?: object;
  start: string | Date;
  end: string | Date;
  location: string;
}) => {
  let startDate: Date;
  let endDate: Date;

  if (start) {
    startDate = typeof start === "string" ? new Date(start) : start;
  } else {
    startDate = addHours(new Date(), 2);
    startDate.setMinutes(0);
  }

  if (end) {
    endDate = typeof end === "string" ? new Date(end) : end;
  } else {
    endDate = addHours(startDate, 1);
    endDate.setMinutes(0);
  }
  const inviteDescription = `You're joining as a ${role} \n\n${description && "for".concat(convertLexicalToPlaintext({ data: description as SerializedEditorState }))}`;

  return createCalendarInvite({
    summary: eventSummary,
    description: inviteDescription,
    start: startDate,
    end: endDate,
    location: location,
  });
};
