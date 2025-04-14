"use server";

import config from "@payload-config";
import { cookies } from "next/headers";
import { generatePayloadCookie, getPayload } from "payload";
import { z } from "zod";

export async function login(
  prevState: { message: string },
  formData: FormData,
) {
  const schema = z.object({
    email: z.string().min(5),
    password: z.string().min(8),
  });
  const parse = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parse.success) {
    return {
      success: false,
      message: "Failed to log in",
      errors: parse.error.errors,
    };
  }

  const data = parse.data;

  const payload = await getPayload({ config });

  try {
    const result = await payload.login({
      collection: "users",
      data,
    });

    if (!result.token) {
      return {
        success: false,
        message: "Login failed, Token expected.",
        errors: [],
      };
    }

    const collection = payload.collections.users;
    const cookie = generatePayloadCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token: result.token,
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
