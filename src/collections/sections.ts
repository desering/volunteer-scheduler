import type { CollectionConfig } from "payload";
import { hasRole } from "./access";

export const Sections: CollectionConfig = {
  slug: "sections",
  access: {
    read: hasRole("admin", "editor"),
    create: hasRole("admin", "editor"),
    update: hasRole("admin", "editor"),
    delete: hasRole("admin", "editor"),
  },
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
