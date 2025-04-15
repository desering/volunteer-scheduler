"use server";

import { z } from "zod";
import { headers as getHeaders } from "next/dist/server/request/headers";
import { getPayload } from "payload";
import config from "@payload-config";

export async function deleteSignup(id: number) {
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
