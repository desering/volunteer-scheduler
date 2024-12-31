import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const createUser = defineAction({
  input: z.object({
    email: z.string(),
    password: z.string(),
    preferredName: z.string(),
  }),
  handler: async (input, { locals: { payload } }) => {
    // Check if user already exists
    const existingUser = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: input.email,
        },
      },
    });

    if (existingUser.totalDocs > 0) {
      throw new ActionError({
        code: "CONFLICT",
        message: "Email is already in use",
      });
    }

    const user = await payload.create({
      collection: "users",
      data: input,
    });

    return user;
  },
});
