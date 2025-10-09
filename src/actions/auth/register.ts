"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { login } from "./login";

export const register = async (
  _prevState: { message: string },
  formData: FormData,
) => {
  const schema = z.object({
    preferredName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    password: z.string().min(8),
    passwordAgain: z.string().min(8),
  });
  const parse = schema.safeParse({
    preferredName: formData.get("preferredName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    password: formData.get("password"),
    passwordAgain: formData.get("passwordAgain"),
  });

  if (!parse.success) {
    return {
      success: false,
      message: "Failed to register",
      errors: parse.error.errors,
    };
  }

  const data = parse.data;

  const payload = await getPayload({ config });

  try {
    // Check if user already exists
    const findUserResult = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: data.email,
        },
      },
    });

    if (findUserResult.totalDocs > 0) {
      return { success: false, message: "Email is already in use" };
    }

    await payload.create({
      collection: "users",
      data,
    });
  } catch (error) {
    return {
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }

  try {
    const loginResult = await login({
      email: data.email,
      password: data.password,
    });

    return {
      success: loginResult.token,
      message: loginResult.token
        ? "Registration and login successful"
        : "Registration successful, but login failed",
    };
  } catch (error) {
    return {
      success: false,
      message: `Login after registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
