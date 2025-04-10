import { generatePayloadCookie } from "payload";

export const loginUser = defineAction({
  input: z.object({
    email: z.string(),
    password: z.string(),
  }),
  handler: async (input, { cookies, locals: { payload } }) => {
    const result = await payload.login({
      collection: "users",
      data: input,
    });

    if (!result.token) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Login failed. Token expected.",
      });
    }

    const collection = payload.collections.users;
    const cookie = generatePayloadCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token: result.token,
      returnCookieAsObject: true,
    });

    cookies.set(cookie.name, cookie.value ?? "", {
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

    return true;
  },
});
