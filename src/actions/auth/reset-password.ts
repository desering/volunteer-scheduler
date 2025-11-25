"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordData = z.infer<typeof schema>;

export type ResetPasswordSuccess = {
  success: true;
  message: string;
};

export type ResetPasswordFailure = {
  success: false;
  errors: ReturnType<typeof z.flattenError<ResetPasswordData>>;
};

export type ResetPasswordResult = ResetPasswordSuccess | ResetPasswordFailure;

export const resetPassword = async (formData: FormData): Promise<ResetPasswordResult> => {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parse = schema.safeParse({ token, password, confirmPassword });

  if (!parse.success) {
    return {
      success: false,
      errors: z.flattenError(parse.error),
    };
  }

  const payload = await getPayload({ config });

  try {
    await payload.resetPassword({
      collection: "users",
      data: {
        token,
        password,
      },
      overrideAccess: true
    });
  } catch (error) {
    return {
      success: false,
      errors: {
        formErrors: [`Failed to reset password: ${error instanceof Error ? error.message : "Unknown error"}`],
        fieldErrors: {},
      },
    };
  }

  return {
    success: true,
    message: "Your password has been reset successfully!",
  };
};
