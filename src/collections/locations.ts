import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const Locations: CollectionConfig = {
  slug: "locations",
  admin: {
    useAsTitle: "title",
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
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "address",
      type: "text",
    },
  ],
};
