import { APIError, type CollectionConfig, type FieldHook } from "payload";

export const Signups: CollectionConfig = {
  slug: "signups",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["role", "user"],
    group: false,
  },
  fields: [
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      label: "Event",
      hasMany: false,
      required: true,
      maxDepth: 3,
      admin: {
        condition: (siblingData) => {
          return !(
            siblingData?.event === undefined && siblingData?.role !== undefined
          );
        },
      },
      hooks: {
        // When creating from sections screen, get event from section
        beforeValidate: [
          async ({ siblingData, req }) => {
            if (!siblingData?.event && siblingData?.role) {
              const section = await req.payload.findByID({
                collection: "roles",
                id: siblingData.role,
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
      name: "role",
      type: "relationship",
      relationTo: "roles",
      label: "Role",
      required: true,
      hasMany: false,
      maxDepth: 1,
      filterOptions: ({ siblingData }) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return { event: { equals: (siblingData as any).event } };
      },
      hooks: {
        beforeValidate: [
          async ({ operation, req, data }) => {
            if (operation === "create") {
              const role = await req.payload.findByID({
                collection: "roles",
                id: data?.role,
              });

              const signups = await req.payload.count({
                collection: "signups",
                where: {
                  role: { equals: role.id },
                },
              });

              if (
                role.maxSignups !== 0 &&
                signups.totalDocs >= role.maxSignups
              ) {
                throw new APIError("This role is full", 400, undefined, true);
              }
            }
          },
        ],
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      label: "User",
      required: true,
      hasMany: false,
      maxDepth: 1,
    },

    // Lets show the user's preferred name instead of boring ID's
    {
      name: "title",
      type: "text",
      admin: {
        hidden: true, // Hide it from the list and admin ui
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            siblingData.title = undefined;
          },
        ],
        afterRead: [
          async ({ data, req }) => {
            const user = await req.payload.findByID({
              collection: "users",
              id: data?.user,
            });

            return user.preferredName;
          },
        ],
      },
    },
  ],
};
