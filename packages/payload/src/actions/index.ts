"use server";

import config from "@payload-config";
import type { EventTemplate } from "@payload-types";
import { getDate, getHours, getMinutes, getMonth, getYear } from "date-fns";
import { type RequiredDataFromCollectionSlug, getPayload } from "payload";

const payload = await getPayload({
  config,
});

export const getEventsInPeriod = async (start: Date, end: Date) => {
  const events = await payload.find({
    collection: "events",
    where: {
      start_date: {
        greater_than_equal: start,
      },
      end_date: {
        less_than_equal: end,
      },
    },
    sort: "start_date",
    pagination: false,
  });
  return events;
};

export const createEventsFromTemplate = async (
  templateId: number,
  selectedDays: Date[],
) => {
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

const eventTemplateToEvent = (template: EventTemplate, day: Date) => {
  const startTime = new Date(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(template.start_time),
    getMinutes(template.start_time),
  );

  const endTime = new Date(
    getYear(day),
    getMonth(day),
    getDate(day),
    getHours(template.end_time),
    getMinutes(template.end_time),
  );

  return {
    title: template.event_title,
    description: template.description,
    start_date: startTime.toISOString(),
    end_date: endTime.toISOString(),
  } satisfies RequiredDataFromCollectionSlug<"events">;
};

const createRoles = async (
  eventId: number,
  transactionID: string | number,
  roles: EventTemplate["roles"],
  sectionId?: number,
) => {
  if (!roles) return;

  for (const role of roles) {
    const createdRole = await payload.create({
      collection: "roles",
      data: {
        event: eventId,
        section: sectionId,
        title: role.title,
        description: role.description,
        maxSignups: role.maxSignups,
      },
      req: { transactionID },
    });

    if (!createdRole) throw new Error("Failed to create role");

    if (role.signups) {
      for (const signup of role.signups) {
        const createdSignup = await payload.create({
          collection: "signups",
          data: {
            event: eventId,
            role: createdRole.id,
            user: signup.user,
          },
          req: { transactionID },
        });

        if (!createdSignup) throw new Error("Failed to create signup");
      }
    }
  }
};
