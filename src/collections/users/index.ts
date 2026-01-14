import type { CollectionConfig } from "payload";
import { preferredNameSchema } from "../../lib/schemas/preferred-name";
import { admins } from "../access/admins";
import { anyone } from "../access/anyone";
import { adminAndThemselves } from "./access/admin-and-themselves";
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

      validate: (value: string | string[] | null | undefined) => {
        // Treat empty/undefined/null as invalid (required: true handles this too)
        if (value == null || value === '') {
          return 'Preferred name is required';
        }

        // If someone ever sets hasMany: true on this field, reject arrays explicitly
        if (Array.isArray(value)) {
          return 'Preferred name must be a single value';
        }

        const r = preferredNameSchema.safeParse(value);
        return r.success
          ? true
          : (r.error.errors[0]?.message ?? "Invalid preferred name");
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
