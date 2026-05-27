import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";

export const OidcPendingLinks: CollectionConfig = {
  slug: "oidc-pending-links",
  admin: {
    useAsTitle: "email",
    group: "Admin",
  },
  access: {
    admin: admins,
    create: () => false,
    read: admins,
    update: () => false,
    delete: admins,
  },
  fields: [
    {
      name: "token",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "issuer",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "subject",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
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
