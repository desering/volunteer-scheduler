import type { CollectionConfig } from "payload";
import type { WebcalToken } from "@/payload-types";
import { admins } from "./access/admins";
import { themselves as _themselves } from "./access/themselves";

const themselves = _themselves<WebcalToken>((data) => Number(data.user));

export const WebcalTokens: CollectionConfig = {
  slug: "webcal-tokens",
  admin: {
    useAsTitle: "token",
    group: "Admin",
  },
  access: {
    admin: admins,
    create: () => true,
    read: themselves,
    update: () => false,
    delete: themselves,
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
