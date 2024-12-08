import payloadConfig from "@payload-config";
import { defineMiddleware, sequence } from "astro:middleware";
import { getPayload } from "payload";

export const onRequest = defineMiddleware(async (context, next) => {
	const payload = await getPayload({ config: payloadConfig });
	context.locals.payload = payload;

	if (context.cookies.get("payload-token")) {
		const auth = await payload.auth({
			headers: context.request.headers,
		});

		if (auth.user) {
			context.locals.user = auth.user;
		}
	}

	return await next();
});
