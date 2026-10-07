import type { GlobalConfig } from "payload";
import { admins } from "@/collections/access/admins";
import { DEFAULT_SETTINGS } from "@/lib/engagement/settings";

const d = DEFAULT_SETTINGS;

/**
 * The organisation's choices about volunteering. Read through
 * `getEngagementSettings`, which fills in defaults for anything never saved.
 */
export const VolunteerSettings: GlobalConfig = {
  slug: "volunteer-settings",
  label: "Volunteer settings",
  admin: { group: "Volunteers" },
  access: {
    read: admins,
    update: admins,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Regular volunteers",
          description:
            "Regular volunteers can show a regular card in the app to get their perks. Changes apply straight away, to everyone.",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "regularMinShifts",
                  label: "At least this many shifts",
                  type: "number",
                  required: true,
                  min: 1,
                  defaultValue: d.regularMinShifts,
                },
                {
                  name: "regularWindowDays",
                  label: "In the last … days",
                  type: "number",
                  required: true,
                  min: 7,
                  defaultValue: d.regularWindowDays,
                },
              ],
            },
            {
              name: "perks",
              label: "What regulars get",
              type: "array",
              defaultValue: d.perks.map((text) => ({ text })),
              admin: {
                description: "Shown on the regular card, one line each.",
              },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "cardNote",
              label: "Note on the card",
              type: "text",
              defaultValue: d.cardNote,
            },
          ],
        },
        {
          label: "Shift badges",
          description:
            "Badges for the number of shifts done. Skills have their own badges, set on each skill.",
          fields: [
            {
              name: "milestones",
              type: "array",
              defaultValue: d.milestones,
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "shifts", type: "number", required: true, min: 1 },
                    { name: "label", type: "text", required: true },
                    {
                      name: "badge",
                      type: "text",
                      required: true,
                      maxLength: 16,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "After a shift",
          description:
            "A thank-you email after each shift, with any new badges, regular status and the trainings they can now join. Volunteers can switch it off under Account → Notification settings.",
          fields: [
            {
              name: "afterShiftEmails",
              label: "Send a thank-you email after each shift",
              type: "checkbox",
              defaultValue: d.afterShiftEmails,
              admin: {
                description:
                  "Off by default. Shifts that end while this is off never get an email later.",
              },
            },
            {
              name: "afterShiftDelayHours",
              label: "Hours to wait after the shift ends",
              type: "number",
              required: true,
              min: 0,
              defaultValue: d.afterShiftDelayHours,
              admin: {
                description:
                  "Time for coordinators to mark no-shows before badges and emails go out.",
              },
            },
            {
              name: "afterShiftSubject",
              label: "Subject",
              type: "text",
              required: true,
              defaultValue: d.afterShiftSubject,
            },
            {
              name: "afterShiftBody",
              label: "Message",
              type: "textarea",
              required: true,
              defaultValue: d.afterShiftBody,
              admin: {
                rows: 8,
                description:
                  "{name} = their name, {event} = the shift, {shifts} = how many shifts they have done. Progress and next steps are added below automatically.",
              },
            },
          ],
        },
      ],
    },
  ],
};
