"use server";

import config from "@payload-config";
import { login as payloadLogin } from "@payloadcms/next/auth";
import { z } from "zod";
import type { User } from "@/payload-types";

const schema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SignInUserData = z.infer<typeof schema>;

export type SignInSuccess = {
  success: true;
  message: string;
  user: User;
  token?: string;
};

export type SignInFailure = {
  success: false;
  message: ReturnType<typeof z.flattenError<SignInUserData>>;
};

export type SignInResult = SignInSuccess | SignInFailure;

export const signIn = async (formData: FormData): Promise<SignInResult> => {
  const parse = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parse.success) {
    return {
      success: false,
      message: z.flattenError(parse.error),
    };
  }

  const { email, password } = parse.data;

  try {
    const result = await payloadLogin({
      collection: "users",
      config,
      email,
      password,
    });

    return {
      success: true,
      message: "Sign-in successful",
      user: result.user,
      token: result.token,
    };
  } catch (error) {
    return {
      success: false,
      message: {
        formErrors: [
          `Sign-in failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        fieldErrors: {},
      },
    };
  }
};
