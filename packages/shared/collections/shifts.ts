import type { CollectionConfig } from "payload";

export const Shifts: CollectionConfig = {
  slug: "shifts",
  defaultSort: "-start_date",
  admin: {
    useAsTitle: "title",
    group: "Shift Management",
    components: {
      views: {
        list: {
          actions: [
            {
              path: "/components/switch-to-calender-view#SwitchToCalenderView",
            },
          ],
        },
      },
    },
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          virtual: true,
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "start_date",
              label: "Start Date",
              type: "date",
              required: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
              },
            },
            {
              name: "end_date",
              label: "End Date",
              type: "date",
              required: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
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
            {
              name: "description",
              type: "richText",
            },
          ],
        },
        {
          label: "Sections",
          virtual: true,
          fields: [
            {
              name: "sections",
              label: false,
              type: "join",
              collection: "sections",
              on: "shift",
              maxDepth: 0,
              virtual: true,
              admin: {
                disableListColumn: true,
              },
            },
          ],
        },
        {
          label: "Roles",
          virtual: true,
          fields: [
            {
              name: "roles",
              label: false,
              type: "join",
              collection: "roles",
              on: "shift",
              maxDepth: 0,
              virtual: true,
              admin: {
                // allowCreate: false,
                disableListColumn: true,
              },
            },
          ],
        },
        {
          label: "Signups",
          virtual: true,
          fields: [
            {
              name: "signups",
              label: false,
              type: "join",
              collection: "signups",
              on: "shift",
              maxDepth: 0,
              virtual: true,
              admin: {
                // allowCreate: false,
                disableListColumn: true,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Delete all related sections first, as of 22-12-2024 payload does not do cascade delete on one to one relationships
        await req.payload.delete({
          collection: "sections",
          where: {
            shift: {
              equals: id,
            },
          },
        });
      },
    ],
  },
};
