"use server";

import { tzOffset } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";
import config from "@payload-config";
import type { EventTemplate } from "@payload-types";
import {
  addMinutes,
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from "date-fns";
import { getPayload, type RequiredDataFromCollectionSlug } from "payload";
import { createRoles } from "./create-roles";

export const createEventsFromTemplate = async (
  templateId: number,
  selectedDays: UTCDate[],
) => {
  const payload = await getPayload({
    config,
  });

  const template = await payload.findByID({
    collection: "event-templates",
    id: templateId,
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const transactionID = (await payload.db.beginTransaction()) || undefined;

  if (!transactionID) {
    throw new Error("Failed to start transaction");
  }

  try {
    for (const day of selectedDays) {
      const createdEvent = await payload.create({
        collection: "events",
        data: eventTemplateToEvent(template, day),
        req: { transactionID },
      });

      if (!createdEvent) throw new Error("Failed to create event");

      if (template.sections) {
        for (const templateSection of template.sections) {
          const createdSection = await payload.create({
            collection: "sections",
            data: {
              event: createdEvent.id,
              title: templateSection.title,
              description: templateSection.description,
            },
            req: { transactionID },
          });

          if (!createdSection) throw new Error("Failed to create section");

          await createRoles(
            createdEvent.id,
            transactionID,
            templateSection.roles,
            createdSection.id,
          );
        }
      }

      if (template.roles) {
        await createRoles(createdEvent.id, transactionID, template.roles);
      }
    }

    await payload.db.commitTransaction(transactionID);
  } catch (error) {
    payload.db.rollbackTransaction(transactionID);
    throw error;
  }
};

const eventTemplateToEvent = (template: EventTemplate, day: UTCDate) => {
  const templateStartTime = new UTCDate(template.start_time);
  const templateEndTime = new UTCDate(template.end_time);

  const templateOffset = tzOffset(template.start_time_tz, templateStartTime);

  const eventStartTime = new UTCDate(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(templateStartTime),
    getMinutes(templateStartTime),
  );

  const eventEndTime = new UTCDate(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(templateEndTime),
    getMinutes(templateEndTime),
  );

  const targetOffset = tzOffset(template.start_time_tz, eventStartTime);

  const offsetDifference = targetOffset - templateOffset;

  const startTime = addMinutes(eventStartTime, -offsetDifference);
  const endTime = addMinutes(eventEndTime, -offsetDifference);

  // Extract tag and location IDs from the template
  const tagIds = template.tags
    ? template.tags.map((tag) => (typeof tag === "object" ? tag.id : tag))
    : undefined;

  const locationIds = template.locations
    ? template.locations.map((location) => (typeof location === "object" ? location.id : location))
    : undefined;

  return {
    title: template.event_title,
    description: template.description,
    start_date: startTime.toISOString(),
    end_date: endTime.toISOString(),
    tags: tagIds,
    locations: locationIds,
  } satisfies RequiredDataFromCollectionSlug<"events">;
};
