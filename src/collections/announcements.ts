import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const Announcements: CollectionConfig = {
  slug: "announcements",
  admin: {
    useAsTitle: "title",
    group: "Admin",
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
      label: "Title",
    },
    {
      name: "description",
      type: "richText",
      label: "Description",
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "info",
      options: [
        { label: "Neutral", value: "neutral" },
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Success", value: "success" },
      ],
    },
  ],
};
