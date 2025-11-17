import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  defaultSort: "-start_date",
  admin: {
    useAsTitle: "title",
    group: "Event Management",
    components: {
      views: {
        list: {
          actions: [
            {
              path: "/components/switch-to-calendar-view#SwitchToCalendarView",
            },
          ],
        },
      },
    },
  },
  access: {
    read: () => true,
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
                  timeFormat: "HH:mm",
                  displayFormat: "dd/MM/y HH:mm",
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
                  timeFormat: "HH:mm",
                  displayFormat: "dd/MM/y HH:mm",
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
            {
              name: "tags",
              type: "relationship",
              relationTo: "tags",
              hasMany: true,
            },
          ],
        },
        {
          label: "Sections",
          fields: [
            {
              name: "sections",
              label: false,
              type: "join",
              collection: "sections",
              on: "event",
              maxDepth: 1,
              admin: {
                disableListColumn: true,
              },
            },
          ],
        },
        {
          label: "Roles",
          fields: [
            {
              name: "roles",
              label: false,
              type: "join",
              collection: "roles",
              on: "event",
              maxDepth: 1,
              admin: {
                // allowCreate: false,
                disableListColumn: true,
              },
            },
          ],
        },
        {
          label: "Signups",
          fields: [
            {
              name: "signups",
              label: false,
              type: "join",
              collection: "signups",
              on: "event",
              maxDepth: 1,
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
            event: {
              equals: id,
            },
          },
        });
      },
    ],
  },
};
