import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const UserNotificationPreferences: CollectionConfig = {
  slug: "user-notification-preferences",
  admin: {
    group: false,
  },
  access: {
    admin: hasRole("admin"),
    create: hasRole("admin"),
    read: hasRole("admin"),
    update: hasRole("admin"),
    delete: hasRole("admin"),
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      label: "User",
      required: true,
      hasMany: false,
      maxDepth: 1,
    },
    {
      name: "type",
      type: "text",
      required: true,
    },
    {
      name: "channel",
      type: "text",
      required: true,
    },
    {
      name: "preference",
      type: "checkbox",
      required: true,
    },
  ],
  indexes: [
    {
      fields: ["user", "type", "channel"],
      unique: true,
    },
  ],
  lockDocuments: false,
  disableDuplicate: true,
};
