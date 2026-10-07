import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";
import { anyone } from "./access/anyone";

/**
 * A skill is something a volunteer can learn: in a training (an event with
 * this skill under "Skills taught") or on the spot from a coordinator. Each
 * skill shows up for the volunteer as a badge.
 *
 * Builds on the Skills roadmap item and the open skills PRs (#343–#346): same
 * `skills` collection and `events.skills` link. What it adds is prerequisites
 * and an "invite after N shifts" threshold, which together drive training
 * invitations.
 */
export const Skills: CollectionConfig = {
  slug: "skills",
  admin: {
    useAsTitle: "title",
    group: "Volunteers",
    defaultColumns: ["badge", "title", "inviteAfterShifts", "prerequisites"],
    description:
      "Something a volunteer can learn, in a training or on a shift. Volunteers see each skill they have as a badge.",
  },
  defaultSort: "title",
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "badge",
          type: "text",
          required: true,
          defaultValue: "⭐",
          maxLength: 16,
          admin: {
            width: "120px",
            description: "An emoji, e.g. 🔪 or ☕",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "description",
      type: "richText",
      admin: {
        description:
          "What a volunteer learns. Doubles as the teaching guide for whoever runs the training.",
      },
    },
    {
      name: "prerequisites",
      type: "relationship",
      relationTo: "skills",
      hasMany: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: {
        description:
          "Skills a volunteer needs first. We only invite people who have all of them.",
      },
    },
    {
      name: "inviteAfterShifts",
      label: "Invite after this many shifts",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description:
          "Invite volunteers to learn this once they have done this many shifts. 0 = from the start.",
      },
    },
    {
      name: "awards",
      label: "Volunteers with this skill",
      type: "join",
      collection: "skill-awards",
      on: "skill",
      access: { read: admins },
      admin: {
        allowCreate: false,
        defaultColumns: ["user", "source", "awardedAt"],
      },
    },
  ],
};
