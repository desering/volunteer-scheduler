"use server";

import config from "@payload-config";
import type { EventTemplate } from "@payload-types";
import { getPayload } from "payload";

const payload = await getPayload({
  config,
});

export const createRoles = async (
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
