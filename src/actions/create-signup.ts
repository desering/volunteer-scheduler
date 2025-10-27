"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { getUser } from "@/lib/services/get-user";

const schema = z.object({
  eventId: z.number(),
  roleId: z.number(),
});

export type CreateSignupRequest = z.infer<typeof schema>;

export async function createSignup(request: CreateSignupRequest) {
  const { user } = await getUser();

  if (!user) {
    return {
      success: false,
      message: "User must be logged in",
    };
  }

  const parse = schema.safeParse(request);

  if (!parse.success) {
    return {
      success: false,
      message: "Submitted data incorrect",
      errors: z.flattenError(parse.error),
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
