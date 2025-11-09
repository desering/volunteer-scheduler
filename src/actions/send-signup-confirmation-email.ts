"use server";

import config from "@payload-config";
import type { Signup } from "@payload-types";
import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";
import { getPayload, type SendEmailOptions } from "payload";

type CreateCalendarInviteParams = {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
};
const createCalendarInvite = (
  params: CreateCalendarInviteParams,
): ICalCalendar => {
  const calendar = ical({
    name: "De Sering",
    method: ICalCalendarMethod.REQUEST,
  });

  calendar.createEvent({
    summary: params.summary,
    description: {
      plain: params.description,
    },
    start: params.start,
    end: params.end,
    location: params.location,
    organizer: "schedule@desering.org",
  } as ICalEventData);

  return calendar;
};

type SendEmailParams = SendEmailOptions;
const sendEmail = async (params: SendEmailParams) => {
  const payload = await getPayload({ config });

  return payload.sendEmail({
    from: "De Sering Schedule <schedule@desering.org>",
    ...params,
  });
};

type SendSignupConfirmationEmailParams = {
  signup: Signup;
};

export const sendSignupConfirmationEmail = async (
  params: SendSignupConfirmationEmailParams,
) => {
  console.log(params);

  const start = new Date();
  const end = new Date();
  end.setHours(start.getHours() + 1);

  const invite = createCalendarInvite({
    summary: "Tuesday Evening First Shift",
    description: "plain event description",
    start: start,
    end: end,
    location: "De Sering, Rhoneweg 6, 1043 AH Amsterdam",
  });

  const email = await sendEmail({
    to: "TODO: RECIPIENT HERE",
    subject: "Shift Signup Notification",
    text: "This is a plain text body",
    html: "<p>This a html body</p>",
    attachments: [
      {
        content: invite.toString(),
        contentType: "text/calendar",
      },
    ],
  });
};
