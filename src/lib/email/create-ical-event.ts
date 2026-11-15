import ical, {
  type ICalCalendar,
  ICalCalendarMethod,
  type ICalEventData,
} from "ical-generator";

type CreateIcalEventParams = {
  id?: string;
  summary: string;
  description?: string;
  roleTitle: string;
  start: string | Date;
  end: string | Date;
  location?: string;
};

export const createIcalEvent = (
  params: CreateIcalEventParams,
): ICalCalendar => {
  const calendar = ical({
    name: process.env.ORG_NAME
      ? `${process.env.ORG_NAME} Calendar`
      : "Event Calendar",
    method: ICalCalendarMethod.REQUEST,
  });

  const startDate: Date =
    typeof params.start === "string" ? new Date(params.start) : params.start;
  const endDate: Date =
    typeof params.end === "string" ? new Date(params.end) : params.end;

  const description = `You're joining as: ${params.roleTitle}${params.description ? `\nDetails:\n${params.description}` : ""}`;

  calendar.createEvent({
    id: params.id,
    summary: params.summary,
    description: { plain: description },
    start: startDate,
    end: endDate,
    location: params.location,
  } as ICalEventData);

  return calendar;
};
