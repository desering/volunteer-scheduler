"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import ical, { ICalCalendarMethod, ICalDescription } from "ical-generator";

// https://nodemailer.com/
// https://payloadcms.com/docs/email/overview
// https://github.com/sebbo2002/ical-generator
// https://github.com/payloadcms/payload/tree/main/packages/email-nodemailer

export const sendSignupConfirmationEmail = async () => {
  const calendar = ical({
    name: 'my first iCal',
    method: ICalCalendarMethod.REQUEST, // required for email client to display event as an invitation
  });

  const event = calendar.createEvent({
    description(): ICalDescription | null {
      return {
        plain: "",
        html: "",
      };
    },
    summary(): string {
      return "";
    },
  });

  // calendar.createEvent({
  //     start: new Date(),
  //     end: new Date().setHours(startTime.getHours()+1),
  //     summary: 'Example Event',
  //     description: 'It works ;)',
  //     location: 'my room',
  //     url: 'http://sebbo.net/'
  // });

  let message = {
    to: "frickb95@gmail.com",
    headers: {
      "x-invite": {
        prepared: true,
        value: id,
      },
    },
    icalEvent: {
      filename: "invite.ics",
      method: "PUBLISH", // REQUEST
      content: event.toString(),
    },
    subject: "This is a test email",
    text: "This is my message body",
  };

  const payload = await getPayload({ config });
  const email = await payload.sendEmail(message);
  console.log(email);
};
