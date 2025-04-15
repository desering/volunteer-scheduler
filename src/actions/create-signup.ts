"use server";

import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers as getHeaders } from "next/dist/server/request/headers";

export async function createSignup(eventId: number, roleId: number) {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

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
