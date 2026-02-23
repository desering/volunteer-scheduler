"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { preferredNameSchema } from "@/lib/schemas/preferred-name";
import { signIn } from "./sign-in";

const schema = z
  .object({
    preferredName: preferredNameSchema,
    email: z.email(),
    phoneNumber: z.e164(),
    password: z.string().min(8),
    passwordAgain: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordAgain, {
    message: "Passwords don't match",
    path: ["passwordAgain"], // path of error
  });

export type RegisterUserData = z.infer<typeof schema>;

export type RegisterSuccess = {
  success: true;
  message: string;
};

export type RegisterFailure = {
  success: false;
  errors: ReturnType<typeof z.flattenError<RegisterUserData>>;
};

export type RegisterUserResult = RegisterSuccess | RegisterFailure;

export const register = async (
  formData: FormData,
): Promise<RegisterUserResult> => {
  const parse = schema.safeParse({
    preferredName: formData.get("preferred-name"),
    email: formData.get("email"),
    phoneNumber: formData.get("phone-number"),
    password: formData.get("password"),
    passwordAgain: formData.get("password-again"),
  });

  if (!parse.success) {
    return {
      success: false,
      errors: z.flattenError(parse.error),
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
      return {
        success: false,
        errors: {
          formErrors: [],
          fieldErrors: {
            email: ["The provided e-mail is already in use"],
          },
        },
      };
    }

    await payload.create({
      collection: "users",
      data,
    });
  } catch (error) {
    return {
      success: false,
      errors: {
        formErrors: [error instanceof Error ? error.message : "Unknown error"],
        fieldErrors: {},
      },
    };
  }

  try {
    const signInResult = await signIn(formData);

    if (!signInResult.success) {
      throw signInResult;
    }

    return {
      success: true,
      message: "Welcome to the team!",
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        formErrors: [
          `Sign-in after registration has failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
        fieldErrors: {},
      },
    };
  }
};
