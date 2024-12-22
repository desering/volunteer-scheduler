"use server";

import config from "@payload-config";
import type { ShiftTemplate } from "@payload-types";
import { getDate, getHours, getMinutes, getMonth, getYear } from "date-fns";
import { type RequiredDataFromCollectionSlug, getPayload } from "payload";

const payload = await getPayload({
  config,
});

export const getShiftsInPeriod = async (start: Date, end: Date) => {
  const shifts = await payload.find({
    collection: "shifts",
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
  return shifts;
};

export const createShiftsFromTemplate = async (
  templateId: number,
  selectedDays: Date[],
) => {
  const template = await payload.findByID({
    collection: "shift-templates",
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
      const createdShift = await payload.create({
        collection: "shifts",
        data: shiftTemplateToShift(template, day),
        req: { transactionID },
      });

      if (!createdShift) throw new Error("Failed to create shift");

      if (template.sections) {
        for (const templateSection of template.sections) {
          const createdSection = await payload.create({
            collection: "sections",
            data: {
              shift: createdShift.id,
              title: templateSection.title,
              description: templateSection.description,
            },
            req: { transactionID },
          });

          if (!createdSection) throw new Error("Failed to create section");

          await createRoles(
            createdShift.id,
            transactionID,
            templateSection.roles,
            createdSection.id,
          );
        }
      }

      if (template.roles) {
        await createRoles(createdShift.id, transactionID, template.roles);
      }
    }

    await payload.db.commitTransaction(transactionID);
  } catch (error) {
    payload.db.rollbackTransaction(transactionID);
    throw error;
  }
};

const shiftTemplateToShift = (template: ShiftTemplate, day: Date) => {
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
    title: template.shift_title,
    description: template.description,
    start_date: startTime.toISOString(),
    end_date: endTime.toISOString(),
  } satisfies RequiredDataFromCollectionSlug<"shifts">;
};

const createRoles = async (
  shiftId: number,
  transactionID: string | number,
  roles: ShiftTemplate["roles"],
  sectionId?: number,
) => {
  if (!roles) return;

  for (const role of roles) {
    const createdRole = await payload.create({
      collection: "roles",
      data: {
        shift: shiftId,
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
            shift: shiftId,
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
