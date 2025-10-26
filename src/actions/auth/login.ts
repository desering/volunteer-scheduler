"use server";

import config from "@payload-config";
import { login as payloadLogin } from "@payloadcms/next/auth";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const result = await payloadLogin({
      collection: "users",
      config,
      email,
      password,
    });

    return {
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
    };
  } catch (error) {
    return {
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
