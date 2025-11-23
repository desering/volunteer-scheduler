import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateIcalEventParams = {
  id?: string;
  summary: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  location?: string;
};

export const createIcalEvent = (
  params: CreateIcalEventParams,
): ICalCalendar => {
  const calendar = ical({
    name: process.env.ORG_NAME + " Calendar" || "Event Calendar",
    method: ICalCalendarMethod.REQUEST,
  });

  let startDate: Date;
  let endDate: Date;

  try {
    startDate =
      typeof params.start === "string" ? new Date(params.start) : params.start;
    endDate =
      typeof params.end === "string" ? new Date(params.end) : params.end;
  } catch (error) {
    console.error("Could not parse event date", error);
    return calendar;
  }

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
