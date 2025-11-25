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
    name: "De Sering", // todo: don't hardcode our name anywhere
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
  } as ICalEventData);

  return calendar;
};
