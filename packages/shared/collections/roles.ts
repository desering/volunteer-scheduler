import type { CollectionConfig } from "payload";

export const Roles: CollectionConfig = {
  slug: "roles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "shift", "section", "signups"],
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
        allowCreate: false,
        condition: (siblingData) => {
          return !(
            siblingData?.shift === undefined &&
            siblingData?.section !== undefined
          );
        },
      },
      hooks: {
        // 	// When creating from sections screen, get shift from section
        beforeValidate: [
          async ({ siblingData, req }) => {
            if (!siblingData?.shift && siblingData?.section) {
              const section = await req.payload.findByID({
                collection: "sections",
                id: siblingData.section,
                depth: 0,
              });

              if (section) {
                return section.shift;
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
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const shift = (siblingData as any).shift;
        if (!shift) return false;

        return { shift: { equals: shift } };
      },
      admin: {
        allowCreate: false,
      },
    },
    {
      name: "title",
      type: "text",
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
