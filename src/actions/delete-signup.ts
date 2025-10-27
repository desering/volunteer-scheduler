"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { getUser } from "@/lib/services/get-user";

const schema = z.object({
  id: z.number(),
});

export type DeleteSignupRequest = z.infer<typeof schema>;

export async function deleteSignup(request: DeleteSignupRequest) {
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
  const signup = await payload.delete({
    collection: "signups",
    id: data.id,
  });

  if (!signup) {
    return {
      success: false,
      message: "Signup not found",
    };
  }

  return {
    success: true,
    message: "Signup successfully deleted",
  };
}
