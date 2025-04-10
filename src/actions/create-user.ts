import { z } from "zod";

export const createUser = defineAction({
  input: z.object({
    preferredName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    password: z.string(),
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

    return await payload.create({
      collection: "users",
      data: input,
    });
  },
});
