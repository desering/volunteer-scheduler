import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const createSignup = defineAction({
  input: z.object({
    event: z.number(),
    role: z.number(),
  }),
  handler: async (input, context) => {
    if (!context.locals.user)
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "User must be logged in",
      });

    const signup = await context.locals.payload.create({
      collection: "signups",
      data: {
        event: input.event,
        role: input.role,
        user: context.locals.user.id,
      },
    });

    return signup;
  },
});
