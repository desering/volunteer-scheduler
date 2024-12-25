import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
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
