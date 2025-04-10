import { z } from "zod";

export const deleteSignup = defineAction({
  input: z.object({
    id: z.number(),
  }),
  handler: async (input, context) => {
    const signup = await context.locals.payload.delete({
      collection: "signups",
      id: input.id,
    });

    if (!signup)
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Signup not found",
      });

    return true;
  },
});
