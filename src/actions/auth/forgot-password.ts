"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
});

export type ForgotPasswordData = z.infer<typeof schema>;

export type ForgotPasswordSuccess = {
  success: true;
  message: string;
};

export type ForgotPasswordFailure = {
  success: false;
  errors: ReturnType<typeof z.flattenError<ForgotPasswordData>>;
};

export type ForgotPasswordResult =
  | ForgotPasswordSuccess
  | ForgotPasswordFailure;

export const forgotPassword = async (
  formData: FormData,
): Promise<ForgotPasswordResult> => {
  const parse = schema.safeParse({ email: formData.get("email") });

  if (!parse.success) {
    return {
      success: false,
      errors: z.flattenError(parse.error),
    };
  }

  const data = parse.data;

  const payload = await getPayload({ config });

  try {
    await payload.forgotPassword({
      collection: "users",
      data,
    });
  } catch (error) {
    return {
      success: false,
      errors: {
        formErrors: [
          `Failed to send reset password email: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        fieldErrors: {},
      },
    };
  }

  return {
    success: true,
    message:
      "If that email address is in our system, we have sent a password reset link to it.",
  };
};
