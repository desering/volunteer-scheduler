import type { CollectionConfig } from "payload";

export const Roles: CollectionConfig = {
  slug: "roles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "event", "section", "signups"],
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
        allowCreate: false,
        condition: (siblingData) => {
          // hide field if creating from sections screen
          return !(
            siblingData?.event === undefined &&
            siblingData?.section !== undefined
          );
        },
      },
      hooks: {
        // 	// When creating from sections screen, get event from section
        beforeValidate: [
          async ({ siblingData, req }) => {
            if (!siblingData?.event && siblingData?.section) {
              const section = await req.payload.findByID({
                collection: "sections",
                id: siblingData.section,
                depth: 0,
              });

              if (section) {
                return section.event;
              }
            }
          },
        ],
      },
    },
    {
      name: "section",
      type: "relationship",
      relationTo: "sections",
      label: "Section",
      hasMany: false,
      maxDepth: 0,
      filterOptions: ({ siblingData }) => {
        const event = (siblingData as { event?: string }).event;
        if (!event) return false;

        return { event: { equals: event } };
      },
      admin: {
        allowCreate: false,
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
      label: "Signups",
      type: "join",
      collection: "signups",
      on: "role",
    },
  ],
};
