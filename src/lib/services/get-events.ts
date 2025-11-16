"use server";

import { utc } from "@date-fns/utc";
import config from "@payload-config";
import { startOfDay } from "date-fns";
import { getPayload, type WhereField } from "payload";

type GetEventsOptions = {
  minDate?: Date;
  maxDate?: Date;
};

export const getEvents = async (params?: GetEventsOptions) => {
  const payload = await getPayload({ config });

  const minDate = params?.minDate ?? startOfDay(new Date(), { in: utc });
  const maxDate = params?.maxDate;

  const startDateFilter: WhereField = {
    greater_than_equal: minDate.toISOString(),
    ...(maxDate && { less_than_equal: maxDate.toISOString() }),
  };

  const events = await payload.find({
    collection: "events",

    where: { start_date: startDateFilter },

    joins: {
      roles: false,
      sections: false,
      signups: {
        limit: 100,
      },
    },

    sort: "start_date",

    pagination: false,
  });

  return events.docs;
};
