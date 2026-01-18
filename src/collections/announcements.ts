import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";
import { anyone } from "./access/anyone";

export const Announcements: CollectionConfig = {
  slug: "announcements",
  admin: {
    useAsTitle: "title",
    group: "Admin",
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
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
