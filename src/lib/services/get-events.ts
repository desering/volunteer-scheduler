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

  const startDateFilter: WhereField = {
    greater_than_equal: params?.minDate?.toISOString(),
    less_than_equal: params?.maxDate?.toISOString(),
  };

  // Remove undefined fields, payload includes them in the query which breaks it
  for (const key in startDateFilter) {
    if (startDateFilter[key as keyof typeof startDateFilter] === undefined) {
      delete startDateFilter[key as keyof typeof startDateFilter];
    }
  }

  const events = await payload.find({
    collection: "events",

    where: {
      start_date: {
        greater_than_equal: utc(startOfDay(new Date())).toISOString(),
        ...startDateFilter,
      },
    },

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
