import type { CollectionConfig } from "payload";

export const Skills: CollectionConfig = {
  slug: "skills",
  admin: {
    useAsTitle: "title",
    group: "Event Management",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "badge",
      type: "text",
      admin: {
        description: "Badge image identifier for the skill",
      },
    },
  ],
};
