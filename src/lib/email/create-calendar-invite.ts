import { addHours } from "date-fns";
import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateCalendarInviteParams = {
  summary: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  location?: string;
};

export const createCalendarInvite = (
  params: CreateCalendarInviteParams,
): ICalCalendar => {
  const calendar = ical({
    name: process.env.ORG_NAME + " Calendar" || "Event Calendar",
    method: ICalCalendarMethod.REQUEST,
  });

  let startDate: Date;
  let endDate: Date;

  if (params.start) {
    startDate =
      typeof params.start === "string" ? new Date(params.start) : params.start;
  } else {
    startDate = addHours(new Date(), 2);
    startDate.setMinutes(0);
  }

  if (params.end) {
    endDate =
      typeof params.end === "string" ? new Date(params.end) : params.end;
  } else {
    endDate = addHours(startDate, 1);
    endDate.setMinutes(0);
  }

  calendar.createEvent({
    summary: params.summary,
    description: {
      plain: params.description,
    },
    start: params.start,
    end: params.end,
    location: params.location,
    // organizer: "schedule@desering.org",
  } as ICalEventData);

  return calendar;
};
