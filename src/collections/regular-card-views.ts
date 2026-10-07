import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";

/**
 * A log of regular cards being opened (at most one row per volunteer per few
 * hours, see `logCardView`). It is not proof of a free meal, but it is the
 * best signal the app has of how much the perk is used, and so what it costs.
 */
export const RegularCardViews: CollectionConfig = {
  slug: "regular-card-views",
  labels: { singular: "Regular card opened", plural: "Regular cards opened" },
  admin: {
    group: "Volunteers",
    defaultColumns: ["user", "viewedAt"],
  },
  defaultSort: "-viewedAt",
  access: {
    read: admins,
    create: () => false,
    update: () => false,
    delete: admins,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "viewedAt",
      type: "date",
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
  lockDocuments: false,
  disableDuplicate: true,
};
