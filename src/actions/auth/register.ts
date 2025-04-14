"use server";

import { z } from "zod";
import { generatePayloadCookie, getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

export async function register(
  prevState: { message: string },
  formData: FormData,
) {
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

    // Create the new user
    await payload.create({
      // todo: check if successful
      collection: "users",
      data,
    });

    // Log the new user in
    // todo: can we call the login action instead here?
    const loginResult = await payload.login({
      // todo: check if successful
      collection: "users",
      data,
    });

    if (!loginResult.token) {
      return {
        success: false,
        message: "Register succeeded, but could not log in. Strange case.",
      };
    }

    const collection = payload.collections.users;
    const cookie = generatePayloadCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token: loginResult.token,
      returnCookieAsObject: true,
    });

    (await cookies()).set(cookie.name, cookie.value ?? "", {
      maxAge: cookie.maxAge,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite?.toLowerCase() as
        | "lax"
        | "strict"
        | "none"
        | undefined,
      domain: cookie.domain,
      expires: cookie.expires ? new Date(cookie.expires) : undefined,
      path: cookie.path,
    });
  } catch (e) {
    return {
      success: false,
      message: "Username and/or password wrong, please try again.",
    };
  }

  return { success: true, message: "Login successful, redirecting..." };
}
