"use server";

import config from "@payload-config";
import { login as payloadLogin } from "@payloadcms/next/auth";
import { z } from "zod";
import type { User } from "@/payload-types";

const schema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginUserData = z.infer<typeof schema>;

export type LoginSuccess = {
  success: true;
  message: string;
  user: User;
  token?: string;
};

export type LoginFailure = {
  success: false;
  message: ReturnType<typeof z.flattenError<LoginUserData>>;
};

export type LoginResult = LoginSuccess | LoginFailure;

export const login = async (formData: FormData): Promise<LoginResult> => {
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
        formErrors: [error instanceof Error ? error.message : "Unknown error"],
        fieldErrors: {},
      },
    };
  }
};
