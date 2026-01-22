import type { CollectionConfig } from "payload";
import { admins } from "../access/admins";
import { anyone } from "../access/anyone";
import { adminAndThemselves } from "./access/admin-and-themselves";
import { preferredNameSchema } from "../../lib/schemas/preferred-name";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: admins,
    create: anyone,
    read: adminAndThemselves,
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
    useSessions: false,
  },
  fields: [
    {
      name: "preferredName",
      type: "text",
      required: true,
      validate: (value: unknown) => {
        const result = preferredNameSchema.safeParse(value);
        if (!result.success) {
          return result.error.errors[0]?.message || "Invalid preferred name";
        }
        return true;
      },
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
