import type { CollectionConfig } from "payload";

export const Locations: CollectionConfig = {
  slug: "locations",
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
