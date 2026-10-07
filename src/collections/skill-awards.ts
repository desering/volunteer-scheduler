import type { CollectionConfig } from "payload";
import { admins } from "./access/admins";
import { adminsOrOwner } from "./access/admins-or-owner";

/**
 * Who has which skill, and how they got it. One row per volunteer per skill.
 *
 * Differs from the `users-skills` + `learnt` checkbox in PR #344 on purpose:
 * only admins (or the after-shift job, for trainings) create rows, so a badge
 * means the same thing to a coordinator pairing people up as it does on the
 * volunteer's own page. A row also records when and how it was earned.
 */
export const SkillAwards: CollectionConfig = {
  slug: "skill-awards",
  labels: { singular: "Skill award", plural: "Skill awards" },
  admin: {
    group: "Volunteers",
    defaultColumns: ["user", "skill", "source", "awardedAt"],
    description:
      "Who has which skill. Trainings add rows automatically once the training is over; you can also add one by hand when someone learns a skill on a shift.",
  },
  defaultSort: "-awardedAt",
  access: {
    read: adminsOrOwner("user"),
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === "create" && !data.awardedBy && req.user) {
          data.awardedBy = req.user.id;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "skill",
      type: "relationship",
      relationTo: "skills",
      required: true,
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "coordinator",
      options: [
        { label: "Completed a training", value: "training" },
        { label: "Taught by a coordinator", value: "coordinator" },
      ],
    },
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      admin: {
        description: "The training or shift where it was learned, if any.",
      },
    },
    {
      name: "awardedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar" },
    },
    {
      name: "awardedBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Empty when the after-shift job awarded it.",
      },
    },
  ],
  indexes: [{ fields: ["user", "skill"], unique: true }],
};
