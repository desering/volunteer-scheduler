import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateIcalEventParams = {
  id?: string;
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
    id: params.id,
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
