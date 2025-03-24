import type { CollectionConfig, Field } from "payload";
import { admins } from "./access/admins";

export const Sections: CollectionConfig = {
  slug: "sections",
  admin: {
    useAsTitle: "title",
    group: false,
  },
  fields: [
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      label: "Event",
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
