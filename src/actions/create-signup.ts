"use server";

import { getUser } from "@/lib/services/get-user";
import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";

export async function createSignup(eventId: number, roleId: number) {
  const { user } = await getUser();

  if (!user) {
    return {
      success: false,
      message: "User must be logged in",
    };
  }

  const schema = z.object({
    eventId: z.number(),
    roleId: z.number(),
  });
  const parse = schema.safeParse({
    eventId: eventId,
    roleId: roleId,
  });

  if (!parse.success) {
    return {
      success: false,
      message: "Submitted data incorrect",
      errors: parse.error.errors,
    };
  }

  const data = parse.data;

  const payload = await getPayload({ config });
  const signup = await payload.create({
    collection: "signups",
    data: {
      event: data.eventId,
      role: data.roleId,
      user: user.id,
    },
  });

  return signup;
}
