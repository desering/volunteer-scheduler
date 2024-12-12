import { defineMiddleware } from "astro:middleware";
import { getPayloadInstance } from "./utils/global-payload";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.payload = await getPayloadInstance();

  if (context.cookies.get("payload-token")) {
    const auth = await context.locals.payload.auth({
      headers: context.request.headers,
    });

    if (auth.user) {
      context.locals.user = auth.user;
    }
  }

  return await next();
});
