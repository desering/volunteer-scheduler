import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    loginWithUsername: false,
    maxLoginAttempts: 0,
  },
  fields: [
    {
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["admin", "user", "editor"],
    },
    {
      name: "preferredName",

      type: "text",
      required: true,
    },
  ],
};
