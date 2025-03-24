import type { CollectionConfig } from "payload";
import { adminAndThemselves } from "./access/admin-and-themselves";
import { anyone } from "../access/anyone";
import { admins } from "../access/admins";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: admins,
    create: anyone,
    read: anyone,
    update: adminAndThemselves,
    delete: adminAndThemselves,
  },
  admin: {
    useAsTitle: "email",
    group: "Admin",
  },
  auth: {
    loginWithUsername: false,
    maxLoginAttempts: 0,
    tokenExpiration: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  fields: [
    {
      name: "preferredName",
      type: "text",
      required: true,
    },
    {
      name: "phoneNumber",
      type: "text",
      required: false,
    },
    {
      name: "roles",
      type: "select",
      options: ["admin", "editor", "volunteer"],
    },
  ],
};
