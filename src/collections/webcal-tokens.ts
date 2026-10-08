import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const WebcalTokens: CollectionConfig = {
  slug: "webcal-tokens",
  admin: {
    useAsTitle: "token",
    group: "Admin",
  },
  access: {
    admin: hasRole("admin"),
    create: () => false,
    read: hasRole("admin"),
    update: () => false,
    delete: hasRole("admin"),
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
