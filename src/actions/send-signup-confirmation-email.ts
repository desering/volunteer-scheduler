"use server";

import config from "@payload-config";
import { getPayload, SendEmailOptions } from "payload";
import ical, { ICalCalendarMethod, ICalEventData } from "ical-generator";

export const sendSignupConfirmationEmail = async () => {
  const calendar = ical({
    name: "De Sering Calendar",
    method: ICalCalendarMethod.REQUEST,
  });

  const start = new Date();
  const end = new Date();
  end.setHours(start.getHours() + 1);

  calendar.createEvent({
    summary: "Tuesday Evening First Shift",
    description: {
      plain: "plain event description",
    },
    start: start,
    end: end,
    location: "De Sering, Rhoneweg 6, 1043 AH Amsterdam",
    organizer: "schedule@desering.org",
  } as ICalEventData);

  let message: SendEmailOptions = {
    from: "De Sering Schedule <schedule@desering.org>",
    to: "TODO: RECIPIENT HERE",
    subject: "Shift Signup Notification",
    text: "This is a plain text body",
    html: "<p>This a html body</p>",
    attachments: [
      {
        content: calendar.toString(),
        contentType: "text/calendar",
      },
    ],
  };

  const payload = await getPayload({ config });
  await payload.sendEmail(message);
};
