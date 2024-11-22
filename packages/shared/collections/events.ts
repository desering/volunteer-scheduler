import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "start_date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      type: "date",
    },
    {
      name: "is_recurring",
      type: "checkbox",
    },
    {
      name: "description",
      type: "richText",
    },
  ],
};
