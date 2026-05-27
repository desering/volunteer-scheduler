import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";

export const UserIdentities: CollectionConfig = {
  slug: "user-identities",
  admin: {
    useAsTitle: "subject",
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
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "oidc",
      options: ["oidc"],
      admin: {
        readOnly: true,
      },
    },
    {
      name: "issuer",
      type: "text",
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "subject",
      type: "text",
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "emailAtLinkTime",
      type: "email",
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "linkedAt",
      type: "date",
      required: true,
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
