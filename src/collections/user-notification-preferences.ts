import type { CollectionConfig } from "payload";
import { admins } from "@/collections/access/admins";
import { adminAndThemselves } from "@/collections/users/access/admin-and-themselves";

export const UserNotificationPreferences: CollectionConfig = {
  slug: "user-notification-preferences",
  admin: {
    group: false,
  },
  access: {
    admin: admins,
    create: adminAndThemselves,
    read: adminAndThemselves,
    update: adminAndThemselves,
    delete: adminAndThemselves,
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
