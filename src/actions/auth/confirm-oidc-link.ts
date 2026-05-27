"use server";

import config from "@payload-config";
import { cookies } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";
import {
  clearPendingOidcLink,
  confirmPendingOidcLink,
  oidcCookieNames,
} from "@/lib/auth/oidc";
import { createPayloadSessionForUser } from "@/lib/auth/payload-session";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type ConfirmOidcLinkSuccess = {
  success: true;
};

export type ConfirmOidcLinkFailure = {
  success: false;
  errors: ReturnType<typeof z.flattenError<{ password: string }>>;
};

export type ConfirmOidcLinkResult =
  | ConfirmOidcLinkSuccess
  | ConfirmOidcLinkFailure;

export const confirmOidcLink = async (
  formData: FormData,
): Promise<ConfirmOidcLinkResult> => {
  const parse = schema.safeParse({
    password: formData.get("password"),
  });

  if (!parse.success) {
    return {
      success: false,
      errors: z.flattenError(parse.error),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(oidcCookieNames.pendingLink)?.value;
  const payload = await getPayload({ config });

  try {
    const user = await confirmPendingOidcLink({
      password: parse.data.password,
      payload,
      token,
    });
    const session = await createPayloadSessionForUser(payload, user);
    const { name, value, ...options } = session.cookie;

    cookieStore.set(name, value, options);
    cookieStore.delete(oidcCookieNames.pendingLink);

    return {
      success: true,
    };
  } catch (error) {
    await clearPendingOidcLink(payload, token);
    cookieStore.delete(oidcCookieNames.pendingLink);

    return {
      success: false,
      errors: {
        formErrors: [
          error instanceof Error
            ? error.message
            : "Password confirmation failed",
        ],
        fieldErrors: {},
      },
    };
  }
};
