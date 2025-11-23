import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateCalendarInviteParams = {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
};

export const createCalendarInvite = (
  params: CreateCalendarInviteParams,
): ICalCalendar => {
  const calendar = ical({
    name: process.env.ORG_NAME + " Calendar" || "Event Calendar",
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
    // organizer: "schedule@desering.org",
  } as ICalEventData);

  return calendar;
};
