import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateIcalEventParams = {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
};

export const createIcalEvent = (
  params: CreateIcalEventParams,
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
    // organizer: "schedule@desering.org",
  } as ICalEventData);

  return calendar;
};
