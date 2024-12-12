import type { CollectionConfig, Field } from "payload";

export const Sections: CollectionConfig = {
  slug: "sections",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "shift",
      type: "relationship",
      relationTo: "shifts",
      label: "Shift",
      required: true,
      hasMany: false,
      maxDepth: 0,
      admin: {
        allowEdit: false,
        readOnly: true,
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "richText",
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Roles",
          fields: [
            {
              name: "roles",
              label: "",
              type: "join",
              collection: "roles",
              on: "section",
              virtual: true,
              admin: {
                disableListColumn: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
