"use server";

import { utc } from "@date-fns/utc";
import config from "@payload-config";
import { startOfDay } from "date-fns";
import { getPayload, type WhereField } from "payload";
import { withTrace } from "@/utils/otel";

type GetEventsOptions = {
  minDate?: Date;
  maxDate?: Date;
  tags?: string[];
};

type EventsWhereClause = {
  start_date: WhereField;
  tags?: {
    in: number[];
  };
};

export const getEvents = withTrace(
  "homepage.getEvents",
  (span) => async (params?: GetEventsOptions) => {
    const payload = await getPayload({ config });

    const minDate = params?.minDate ?? startOfDay(new Date(), { in: utc });
    const maxDate = params?.maxDate;

    span.setAttribute("events.min_date", minDate.toISOString());
    span.setAttribute("events.max_date", maxDate?.toISOString() ?? "");
    span.setAttribute("events.has_tags_filter", Boolean(params?.tags?.length));
    span.setAttribute("events.tags_count", params?.tags?.length ?? 0);

    const startDateFilter: WhereField = {
      greater_than_equal: minDate.toISOString(),
      ...(maxDate && { less_than_equal: maxDate.toISOString() }),
    };

    const where: EventsWhereClause = { start_date: startDateFilter };

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
      span.setAttribute("events.matched_tag_ids_count", tagIds.length);

      if (tagIds.length > 0) {
        where.tags = {
          in: tagIds,
        };
      }
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

    span.setAttribute("events.result_count", events.docs.length);
    return events.docs;
  },
  { tracerName: "volunteer-scheduler.homepage" },
);
