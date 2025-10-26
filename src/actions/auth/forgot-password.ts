import config from "@payload-config";
import { getPayload } from "payload";

type ForgotPasswordActionParams = {
  email: string;
};

export const forgotPassword = async ({ email }: ForgotPasswordActionParams) => {
  const payload = await getPayload({ config });

  try {
    await payload.forgotPassword({
      collection: "users",
      data: {
        email,
      },
    });
  } catch (error) {
    return {
      success: false,
      message: `Failed to send reset password email: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }

  return {
    success: true,
    message:
      "If that email address is in our system, we have sent a password reset link to it.",
  };
};
