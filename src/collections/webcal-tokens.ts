import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";

export const WebcalTokens: CollectionConfig = {
  slug: "webcal-tokens",
  admin: {
    useAsTitle: "token",
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
      admin: { readOnly: true },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
    },
  ],
  lockDocuments: false,
  disableDuplicate: true,
};
