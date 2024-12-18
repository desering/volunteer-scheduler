import type { ArrayField, CollectionConfig } from "payload";
import { admins } from "./access/admins";

const rolesField = (arg?: {
  description?: string;
  required?: boolean;
}): ArrayField => ({
  name: "roles",
  type: "array",
  required: arg?.required,
  admin: {
    description: arg?.description,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "maxSignups",
      label: "Max Signups",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "The maximum number of signups allowed for this role, 0 for unlimited",
      },
    },
    {
      name: "signups",
      type: "array",
      fields: [
        {
          name: "user",
          type: "relationship",
          relationTo: "users",
          required: true,
          hasMany: false,
        },
      ],
    },
  ],
});

export const ShiftTemplates: CollectionConfig = {
  slug: "shift-templates",
  access: {
    read: admins,
    create: admins,
    delete: admins,
    update: admins,
  },
  admin: {
    useAsTitle: "template_title",
    group: "Shift Management",
  },
  defaultSort: ["template_title"],
  fields: [
    {
      name: "template_title",
      label: "Template Title",
      type: "text",
      required: true,
      hooks: {
        beforeDuplicate: [({ value }) => `${value} - Copy`],
      },
    },
    {
      name: "shift_title",
      label: "Shift Title",
      type: "text",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "shift_start_time",
          label: "Start Time",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "timeOnly",
              timeFormat: "HH:mm",
              displayFormat: "HH:mm",
            },
          },
        },
        {
          name: "shift_end_time",
          label: "End Time",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "timeOnly",
              timeFormat: "HH:mm",
              displayFormat: "HH:mm",
            },
          },
          validate: (
            val,
            { siblingData }: { siblingData: { start_date?: Date } },
          ) => {
            // Make sure end date is after start date
            if (
              val &&
              siblingData.start_date &&
              val <= siblingData.start_date
            ) {
              return "End date must be after the starting date";
            }

            return true;
          },
        },
      ],
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "sections",
      label: "Sections",
      type: "array",
      fields: [
        {
          name: "section_title",
          label: "Section Title",
          type: "text",
          required: true,
        },

        {
          name: "section_description",
          label: "Section Description",
          type: "richText",
        },
        rolesField({ required: true }),
      ],
    },
    rolesField({
      description: "Add roles that are not specific to a section",
    }),
  ],
};
