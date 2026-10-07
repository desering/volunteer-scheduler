import { render } from "@react-email/render";
import type { CollectionConfig } from "payload";
import { ResetPasswordEmail } from "@/email/templates/reset-password";
import { preferredName } from "@/lib/schemas/preferred-name";
import { adminFieldLevel, admins } from "../access/admins";
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
    tokenExpiration: 31 * 24 * 60 * 60, // 31 days in seconds
    useSessions: true,
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
        const result = preferredName.safeParse(value);
        if (!result.success) {
          return result.error.message || "Invalid preferred name";
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
      name: "regularOverride",
      label: "Regular volunteer",
      type: "select",
      defaultValue: "auto",
      options: [
        { label: "Automatic (rule in Volunteer settings)", value: "auto" },
        { label: "Always a regular", value: "always" },
        { label: "Never a regular", value: "never" },
      ],
      access: {
        create: adminFieldLevel,
        read: adminFieldLevel,
        update: adminFieldLevel,
      },
      admin: {
        position: "sidebar",
        description:
          "Use Always for staff and coordinators who should get the perks regardless of shifts.",
      },
    },
    {
      name: "volunteerSummary",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/volunteer-summary#VolunteerSummary",
        },
      },
    },
    {
      name: "roles",
      type: "select",
      access: {
        create: adminFieldLevel,
        update: adminFieldLevel,
      },
      defaultValue: "volunteer",
      options: ["admin", "editor", "volunteer"],
    },
  ],
};
