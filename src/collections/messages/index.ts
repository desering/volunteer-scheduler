import { APIError, type CollectionConfig } from "payload";
import { WEEKDAYS } from "@/lib/engagement/audience";
import { admins } from "../access/admins";

const systemOnly = { create: () => false, update: () => false };

/**
 * A message to a group of volunteers, e.g. an invitation to a training or a
 * get-together. The audience is a set of filters over what people have done;
 * the preview under the filters shows who it will reach before anything goes
 * out. Sending happens in a background job (`send-volunteer-message`).
 *
 * Once a message is no longer a draft it is a record of what was sent and
 * cannot be edited — duplicate it instead.
 */
export const Messages: CollectionConfig = {
  slug: "messages",
  admin: {
    useAsTitle: "subject",
    group: "Volunteers",
    defaultColumns: ["subject", "status", "recipientCount", "sentAt"],
    description:
      "Email a group of volunteers, picked by what they have done. Nothing is sent until you press Send on the message.",
  },
  defaultSort: "-createdAt",
  access: {
    read: admins,
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      ({ originalDoc, operation, req }) => {
        if (
          operation === "update" &&
          originalDoc?.status !== "draft" &&
          !req.context?.messageSystemUpdate
        ) {
          throw new APIError(
            "This message has already been sent and can no longer be changed. Duplicate it to send something similar.",
            400,
            undefined,
            true,
          );
        }
      },
    ],
  },
  fields: [
    {
      name: "subject",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      admin: {
        rows: 10,
        description:
          "Plain text; leave an empty line between paragraphs. {name} becomes the volunteer's name. A link to their volunteering page and how to unsubscribe are added below.",
      },
    },
    {
      name: "audience",
      type: "group",
      admin: {
        description:
          "Who receives this. Every filter you fill in must match; leave a filter empty to ignore it. Volunteers who switched off invitations never receive it.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "minShifts",
              label: "At least … shifts",
              type: "number",
              min: 0,
            },
            {
              name: "maxShifts",
              label: "At most … shifts",
              type: "number",
              min: 0,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "activeWithinDays",
              label: "Volunteered in the last … days",
              type: "number",
              min: 1,
            },
            {
              name: "inactiveForDays",
              label: "Not volunteered for … days",
              type: "number",
              min: 1,
              admin: { description: "Finds people we may be losing." },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "hasSkills",
              label: "Has all of these skills",
              type: "relationship",
              relationTo: "skills",
              hasMany: true,
            },
            {
              name: "lacksSkills",
              label: "Has none of these skills",
              type: "relationship",
              relationTo: "skills",
              hasMany: true,
            },
          ],
        },
        {
          name: "regulars",
          label: "Regular volunteers",
          type: "radio",
          defaultValue: "any",
          options: [
            { label: "Everyone", value: "any" },
            { label: "Only regulars", value: "only" },
            { label: "Not regulars", value: "exclude" },
          ],
        },
        {
          name: "didShift",
          label: "Did a shift like this",
          type: "group",
          admin: {
            description:
              'e.g. role contains "coordinator", on a Tuesday, in the last 90 days.',
          },
          fields: [
            {
              type: "row",
              fields: [
                { name: "roleContains", label: "Role contains", type: "text" },
                {
                  name: "weekday",
                  label: "On a",
                  type: "select",
                  options: WEEKDAYS.map((d) => ({
                    label: d[0].toUpperCase() + d.slice(1),
                    value: d,
                  })),
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "tags",
                  label: "Tagged",
                  type: "relationship",
                  relationTo: "tags",
                  hasMany: true,
                },
                {
                  name: "withinDays",
                  label: "In the last … days",
                  type: "number",
                  min: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "audiencePreview",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/message-audience#MessageAudience",
        },
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
      ],
      access: systemOnly,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "sentAt",
      type: "date",
      access: systemOnly,
      admin: {
        position: "sidebar",
        readOnly: true,
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "sentBy",
      type: "relationship",
      relationTo: "users",
      access: systemOnly,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "recipientCount",
      label: "Delivered to",
      type: "number",
      access: systemOnly,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "deliveries",
      type: "join",
      collection: "message-deliveries",
      on: "message",
      admin: {
        allowCreate: false,
        defaultColumns: ["user", "status", "sentAt"],
      },
    },
  ],
};
