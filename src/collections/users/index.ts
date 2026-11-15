import { render } from "@react-email/render";
import type { Access, CollectionConfig, FieldAccess } from "payload";
import { ResetPasswordEmail } from "@/email/templates/reset-password";
import { preferredName } from "@/lib/schemas/preferred-name";
import { hasRole, or } from "../access";

const editorOwnAccount: Access = ({ req }) =>
  req.user?.roles === "editor" ? { id: { equals: req.user.id } } : false;

const adminOrSelf: FieldAccess = ({ req, id }) =>
  !!req.user && (hasRole("admin")({ req }) || req.user.id === id);

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: hasRole("admin", "editor"),
    create: hasRole("admin"),
    read: or(hasRole("admin"), editorOwnAccount),
    update: or(hasRole("admin"), editorOwnAccount),
    delete: hasRole("admin"),
  },
  admin: {
    hidden: ({ user }) => user?.roles !== "admin",
    useAsTitle: "preferredName",
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
      name: "email",
      type: "email",
      access: {
        read: adminOrSelf,
      },
    },
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
      access: {
        read: adminOrSelf,
      },
    },
    {
      name: "roles",
      type: "select",
      access: {
        read: adminOrSelf,
        create: hasRole("admin"),
        update: hasRole("admin"),
      },
      defaultValue: "volunteer",
      options: ["admin", "editor", "volunteer"],
    },
  ],
};
