import { render } from "@react-email/render";
import type { CollectionConfig } from "payload";
import { ResetPasswordEmail } from "@/email/templates/reset-password";
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
    tokenExpiration: 31 * 24 * 60 * 60, // 31 days in seconds
    useSessions: false,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const { token, user } = args || {};

        if (!token || !user) {
          return "Error: Missing token or user information";
        }

        return render(
          ResetPasswordEmail({ username: user.preferredName, token: token }),
        );
      },
      generateEmailSubject: () => "Reset your password",
    },
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
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
