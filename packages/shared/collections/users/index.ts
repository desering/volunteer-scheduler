import type { CollectionConfig } from "payload";
import { adminAndthemself } from "./access/admins-and-themself";
import { anyone } from "../access/anyone";
import { admins } from "../access/admins";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: admins,
    create: anyone,
    read: anyone,
    update: adminAndthemself,
    delete: adminAndthemself,
  },
  admin: {
    useAsTitle: "email",
    group: "Admin",
  },
  auth: {
    loginWithUsername: false,
    maxLoginAttempts: 0,
  },
  fields: [
    {
      name: "roles",
      type: "select",
      options: ["admin", "editor", "volunteer"],
    },
    {
      name: "preferredName",

      type: "text",
      required: true,
    },
  ],
};
