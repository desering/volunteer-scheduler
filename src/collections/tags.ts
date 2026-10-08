import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "text",
    group: "Event Management",
  },
  access: {
    read: hasRole("admin", "editor"),
    create: hasRole("admin", "editor"),
    update: hasRole("admin", "editor"),
    delete: hasRole("admin", "editor"),
  },
  fields: [
    {
      name: "text",
      type: "text",
      required: true,
    },
  ],
};
