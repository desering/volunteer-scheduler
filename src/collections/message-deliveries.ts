import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";

/**
 * One row per email sent to one volunteer, by a message or after a shift.
 * Doubles as the guard against sending twice: the send job skips anyone who
 * already has a `sent` row for the message.
 */
export const MessageDeliveries: CollectionConfig = {
  slug: "message-deliveries",
  labels: { singular: "Delivery", plural: "Deliveries" },
  admin: {
    group: "Volunteers",
    useAsTitle: "subject",
    defaultColumns: ["subject", "user", "kind", "status", "sentAt"],
    description: "Every email the volunteer features sent, and to whom.",
  },
  defaultSort: "-sentAt",
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
      name: "kind",
      type: "select",
      required: true,
      options: [
        { label: "Message", value: "message" },
        { label: "After a shift", value: "after-shift" },
      ],
    },
    {
      name: "message",
      type: "relationship",
      relationTo: "messages",
    },
    {
      name: "signup",
      type: "relationship",
      relationTo: "signups",
      admin: { description: "The shift an after-shift email was about." },
    },
    { name: "subject", type: "text", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
    { name: "error", type: "text" },
    {
      name: "sentAt",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
  indexes: [{ fields: ["message", "user"], unique: true }],
  lockDocuments: false,
  disableDuplicate: true,
};
