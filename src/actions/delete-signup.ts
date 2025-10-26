"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { getUser } from "@/lib/services/get-user";

export async function deleteSignup(id: number) {
  const { user } = await getUser();

  if (!user) {
    return {
      success: false,
      message: "User must be logged in",
    };
  }

  const schema = z.object({
    id: z.number(),
  });
  const parse = schema.safeParse({
    id: id,
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
