import type { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "text",
    group: "Event Management",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "text",
      type: "text",
      required: true,
    },
  ],
};