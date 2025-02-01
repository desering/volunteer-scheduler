"use server";

import { UTCDate, utc } from "@date-fns/utc";
import config from "@payload-config";
import type { EventTemplate } from "@payload-types";
import { getDate, getHours, getMinutes, getMonth, getYear } from "date-fns";
import { type RequiredDataFromCollectionSlug, getPayload } from "payload";
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
  const startTime = new UTCDate(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(template.start_time, { in: utc }),
    getMinutes(template.start_time, { in: utc }),
  );

  const endTime = new UTCDate(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(template.end_time, { in: utc }),
    getMinutes(template.end_time, { in: utc }),
  );

  return {
    title: template.event_title,
    description: template.description,
    start_date: startTime.toISOString(),
    end_date: endTime.toISOString(),
  } satisfies RequiredDataFromCollectionSlug<"events">;
};
