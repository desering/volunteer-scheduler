"use server";

import type { Payload } from 'payload'
import { groupAndSortEventsByDate } from "@/utils/map-events";

export const getEventsByDay = async (payload: Payload)=> {
  const events = await payload.find({
    collection: "events",

    joins: {
      roles: false,
      sections: false,
    },

    pagination: false,
  });

  return await groupAndSortEventsByDate(events.docs);
};
