import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";
import { adminAndThemselves } from "./users/access/admin-and-themselves";

export const NotificationRegistrations: CollectionConfig = {
  slug: "notification-registrations",
  admin: {
    useAsTitle: "endpoint",
    group: "Admin",
  },
  access: {
    admin: admins,
    create: adminAndThemselves,
    read: adminAndThemselves,
    update: adminAndThemselves,
    delete: adminAndThemselves,
  },
  fields: [
    // a user should be able to have many registrations, change?
    {
      name: "endpoint",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "registration",
      type: "json",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
  ],
  lockDocuments: false,
  disableDuplicate: true,
};
