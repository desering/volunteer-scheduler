import { defineAction } from "astro:actions";

export const getAllEvents = defineAction({
  handler: async (_, context) => {
    return await context.locals.payload.find({
      collection: "events",

      joins: {
        roles: false,
        sections: false,
      },

      pagination: false,
    });
  },
});
