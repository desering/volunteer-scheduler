"use server";

import { utc } from "@date-fns/utc";
import config from "@payload-config";
import { startOfDay } from "date-fns";
import { getPayload, type Where, type WhereField } from "payload";

type GetEventsOptions = {
  minDate?: Date;
  maxDate?: Date;
  tags?: string[];
  locations?: string[];
};

export const getEvents = async (params?: GetEventsOptions) => {
  const payload = await getPayload({ config });

  const minDate = params?.minDate ?? startOfDay(new Date(), { in: utc });
  const maxDate = params?.maxDate;

  const startDateFilter: WhereField = {
    greater_than_equal: minDate.toISOString(),
    ...(maxDate && { less_than_equal: maxDate.toISOString() }),
  };

  const where: Where = { start_date: startDateFilter };
  const andConditions: Where[] = [];

  // Process tags filter
  if (params?.tags && params.tags.length > 0) {
    const tags = await payload.find({
      collection: "tags",
      where: {
        text: {
          in: params.tags,
        },
      },
    });

    const tagIds = tags.docs.map((tag) => tag.id);

    if (tagIds.length > 0) {
      andConditions.push({
        tags: {
          in: tagIds,
        },
      });
    }
  }

  // Process locations filter
  if (params?.locations && params.locations.length > 0) {
    const locations = await payload.find({
      collection: "locations",
      where: {
        text: {
          in: params.locations,
        },
      },
    });

    const locationIds = locations.docs.map((location) => location.id);

    if (locationIds.length > 0) {
      andConditions.push({
        locations: {
          in: locationIds,
        },
      });
    }
  }

  // Apply AND logic if we have multiple conditions
  if (andConditions.length > 0) {
    where.and = andConditions;
  }

  const events = await payload.find({
    collection: "events",

    where,

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
